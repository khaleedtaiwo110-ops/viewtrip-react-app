import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import https from "https";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Travelport OAuth token cache. Travelport documents a 24-hour token lifetime;
// refresh a little early and reuse the token instead of authenticating on every call.
let travelportToken = null;
let travelportTokenExpiresAt = 0;
let tokenRequestInFlight = null;

async function getTravelportToken() {
  const now = Date.now();
  if (travelportToken && now < travelportTokenExpiresAt - 5 * 60 * 1000) {
    return travelportToken;
  }
  if (tokenRequestInFlight) return tokenRequestInFlight;

  tokenRequestInFlight = (async () => {
    const authUrl = process.env.TRAVELPORT_AUTH_URL ||
      (process.env.TRAVELPORT_ENV === "production"
        ? "https://auth.travelport.net/oauth/token"
        : "https://auth.pp.travelport.net/oauth/token");

    try {
      const params = new URLSearchParams();
      params.append("grant_type", "password");
      params.append("username", process.env.TRAVELPORT_USERNAME || "");
      params.append("password", process.env.TRAVELPORT_PASSWORD || "");
      params.append("client_id", process.env.TRAVELPORT_CLIENT_ID || "");
      params.append("client_secret", process.env.TRAVELPORT_CLIENT_SECRET || "");

      const response = await axios.post(authUrl, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 30000
      });

      if (!response.data?.access_token) {
        throw new Error("Travelport authentication response did not contain access_token.");
      }

      travelportToken = response.data.access_token;
      const expiresInSeconds = Number(response.data.expires_in) || 86400;
      travelportTokenExpiresAt = Date.now() + expiresInSeconds * 1000;
      console.log("Travelport OAuth token acquired.");
      return travelportToken;
    } catch (error) {
      console.error("Travelport Authentication Failed:", {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data
      });
      throw new Error("Failed to authenticate with Travelport API");
    } finally {
      tokenRequestInFlight = null;
    }
  })();

  return tokenRequestInFlight;
}

// ==========================================
// TRAVELPORT HELPERS & NORMALIZATION
// ==========================================

const getPassengerCriteria = (adults, children, infants) => {
  const passengers = [];

  if (adults > 0) {
    passengers.push({
      "@type": "PassengerCriteria",
      number: adults,
      passengerTypeCode: "ADT"
    });
  }

  if (children > 0) {
    passengers.push({
      "@type": "PassengerCriteria",
      number: children,
      passengerTypeCode: "CHD"
    });
  }

  if (infants > 0) {
    passengers.push({
      "@type": "PassengerCriteria",
      number: infants,
      passengerTypeCode: "INF"
    });
  }

  return passengers;
};

const normalizeTravelportResponse = (rawData) => {
  const response = rawData?.CatalogProductOfferingsResponse || rawData;
  const catalog = response?.CatalogProductOfferings;
  const offerings = Array.isArray(catalog?.CatalogProductOffering)
    ? catalog.CatalogProductOffering
    : [];

  const referenceList = response?.ReferenceList || [];

  const getGroup = (typeName) =>
    referenceList.find(
      group => group?.type === typeName || group?.["@type"] === typeName
    );

  const buildReferenceIndex = (typeName, collectionName) => {
    const group = getGroup(typeName);
    const records = group?.[collectionName] || [];

    const exact = new Map();

    for (const record of records) {
      if (record?.id) exact.set(record.id, record);
    }

    return {
      get(ref) {
        if (!ref) return null;
        return exact.get(ref) || null;
      }
    };
  };

  const flightIndex = buildReferenceIndex("ReferenceListFlight", "Flight");
  const productIndex = buildReferenceIndex("ReferenceListProduct", "Product");
  const brandIndex = buildReferenceIndex("ReferenceListBrand", "Brand");
  const termsIndex = buildReferenceIndex("ReferenceListTermsAndConditions", "TermsAndConditions");

  const normalizeFlight = (flight) => {
    if (!flight) return null;

    return {
      reference: flight.id || null,
      airline: flight.carrier || null,
      airlineName: flight.operatingCarrierName || null,
      operatingAirline: flight.operatingCarrier || null,
      flightNumber: flight.number || null,
      departure: {
        airport: flight.Departure?.location || null,
        terminal: flight.Departure?.terminal || null,
        date: flight.Departure?.date || null,
        time: flight.Departure?.time || null
      },
      arrival: {
        airport: flight.Arrival?.location || null,
        terminal: flight.Arrival?.terminal || null,
        date: flight.Arrival?.date || null,
        time: flight.Arrival?.time || null
      },
      duration: flight.duration || null,
      stops: flight.stops ?? 0,
      equipment: flight.equipment || null,
      distance: flight.distance ?? null
    };
  };

  const normalizeProduct = (productRef) => {
    const product = productIndex.get(productRef);

    if (!product) {
      return {
        reference: productRef,
        resolved: false,
        flights: [],
        cabin: null,
        fareBasisCode: null,
        fareType: null,
        totalDuration: null
      };
    }

    const segments = Array.isArray(product.FlightSegment)
      ? product.FlightSegment
      : [];

    const flights = segments
      .map(segment => {
        const flightRef = segment.Flight?.FlightRef;
        const flight = flightIndex.get(flightRef);

        return flight
          ? {
              segmentSequence: segment.sequence ?? null,
              ...normalizeFlight(flight)
            }
          : null;
      })
      .filter(Boolean);

    const passengerFlights = product.PassengerFlight || [];
    const flightProducts = passengerFlights.flatMap(
      passenger => passenger.FlightProduct || []
    );

    const firstFlightProduct = flightProducts[0] || {};
    const productBrandRef = firstFlightProduct.Brand?.BrandRef || null;
    const brand = productBrandRef ? brandIndex.get(productBrandRef) : null;

    return {
      reference: productRef,
      resolved: true,
      totalDuration: product.totalDuration || null,
      flights,
      cabin: firstFlightProduct.cabin || null,
      bookingClass: firstFlightProduct.classOfService || null,
      fareBasisCode: firstFlightProduct.fareBasisCode || null,
      fareType: firstFlightProduct.fareType || null,
      brandReference: productBrandRef,
      brandName: brand?.name || null,
      passengerDetails: passengerFlights.map(passenger => ({
        passengerType: passenger.passengerTypeCode || null,
        quantity: passenger.passengerQuantity ?? null
      }))
    };
  };

    const formattedOffers = [];

  for (const offer of offerings) {
    const options = Array.isArray(offer.ProductBrandOptions)
      ? offer.ProductBrandOptions
      : [];

    for (const option of options) {
      const brandOfferings = Array.isArray(option.ProductBrandOffering)
        ? option.ProductBrandOffering
        : [];

      for (const brandOffering of brandOfferings) {
        const price = brandOffering.BestCombinablePrice || {};
        let currency = price.CurrencyCode?.value || null;
        let base = price.Base ?? null;
        let taxes = price.TotalTaxes ?? null;
        let fees = price.TotalFees ?? null;
        let total = price.TotalPrice ?? null;

        const productRefs = (brandOffering.Product || [])
          .map(item => item.productRef)
          .filter(Boolean);

        const products = productRefs.map(normalizeProduct);
        const flights = products.flatMap(product => product.flights);

        if (flights.length === 0) {
          const optionFlightRefs = option.flightRefs || [];
          for (const ref of optionFlightRefs) {
            const flight = flightIndex.get(ref);
            if (flight) {
              flights.push(normalizeFlight(flight));
            }
          }
        }

        const termsRef = brandOffering.TermsAndConditions?.termsAndConditionsRef || null;
        const terms = termsIndex.get(termsRef);
        const brandRef = brandOffering.Brand?.BrandRef || null;
        const brand = brandIndex.get(brandRef);

        const productBrandRefs = [
          ...new Set(
            products.map(product => product.brandReference).filter(Boolean)
          )
        ];

        const baggage = (terms?.BaggageAllowance || []).map(item => ({
          type: item.baggageType || null,
          passengerTypes: item.passengerTypeCodes || [],
          airline: item.validatingAirlineCode || null,
          items: (item.BaggageItem || []).map(bag => ({
            quantity: bag.quantity ?? null,
            included: bag.includedInOfferPrice || null,
            description: bag.Text || null,
            measurements: bag.Measurement || []
          }))
        }));

        const priceBreakdown = (price.PriceBreakdown || []).map(item => ({
          passengerType: item.requestedPassengerType || null,
          quantity: item.quantity ?? null,
          base: item.Amount?.Base ?? null,
          taxes: item.Amount?.Taxes?.TotalTaxes ?? null,
          total: item.Amount?.Total ?? null,
          taxDetails: item.Amount?.Taxes?.Tax || []
        }));

        formattedOffers.push({
          id: offer.id || null,
          sequence: offer.sequence ?? null,
          route: {
            departure: offer.Departure || null,
            arrival: offer.Arrival || null
          },
          airline: flights[0]?.airline || null,
          airlineName:
            flights[0]?.airlineName ||
            flights[0]?.operatingAirline ||
            null,
          operatingAirline: flights[0]?.operatingAirline || null,
          flightNumbers: flights.map(flight => flight.flightNumber),
          flights,
          stops: flights.length > 0 ? flights.length - 1 : null,
          duration: products[0]?.totalDuration || null,
          price: {
            currency,
            base,
            taxes,
            fees,
            total,
            formatted:
              total !== null && currency
                ? `${currency} ${Number(total).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : null,
            breakdown: priceBreakdown
          },
          fare: {
            brandReference: brandRef,
            brandName:
              brand?.name ||
              products.find(p => p.brandName)?.brandName ||
              null,
            productBrandReferences: productBrandRefs,
            productReferences: productRefs,
            products,
            termsAndConditionsReference: termsRef,
            baggage,
            changePenalties: terms?.Penalties?.Change || [],
            cancellationPenalties: terms?.Penalties?.Cancel || [],
            validatingAirlines: (terms?.ValidatingAirline || []).map(
              item => item.ValidatingAirline
            ),
            paymentTimeLimit: terms?.PaymentTimeLimit || null,
            expiryDate: terms?.ExpiryDate || null
          },
          combinabilityCodes: brandOffering.CombinabilityCode || [],
          contentSource: brandOffering.ContentSource || null,
          references: {
            offerId: offer.id || null,
            flightRefs: option.flightRefs || [],
            productRefs,
            brandRef,
            termsRef,
            productBrandOffering: brandOffering
          }
        });
      }
    }
  }

  return {
    transactionId: response.transactionId || null,
    identifier: response.Identifier?.value || catalog?.Identifier?.value || null,
    identifierDetails: response.Identifier || catalog?.Identifier || null,
    result: response.Result || null,
    offers: formattedOffers
  };
};

// ==========================================
// API ENDPOINTS
// ==========================================

// ✅ Travelport Flight Offers API
app.get("/api/flight-offers", async (req, res) => {
  console.log("Travelport search request:", req.query);

  try {
    const {
      origin,
      destination,
      date,
      returnDate,
      adults = "1",
      children = "0",
      infants = "0",
      travelClass = "Economy"
    } = req.query;

    if (!origin || !destination || !date) {
      return res.status(400).json({
        success: false,
        error: "Origin, destination and departure date are required."
      });
    }

    const airportCodeRegex = /^[A-Z]{3}$/;
    const originCode = String(origin).trim().toUpperCase();
    const destinationCode = String(destination).trim().toUpperCase();

    if (
      !airportCodeRegex.test(originCode) ||
      !airportCodeRegex.test(destinationCode)
    ) {
      return res.status(400).json({
        success: false,
        error: "Origin and destination must be valid three-letter IATA codes."
      });
    }

    if (originCode === destinationCode) {
      return res.status(400).json({
        success: false,
        error: "Origin and destination cannot be the same."
      });
    }

    const isValidDate = (value) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
      new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

    if (!isValidDate(String(date))) {
      return res.status(400).json({
        success: false,
        error: "Departure date must use YYYY-MM-DD format."
      });
    }

    if (returnDate) {
      if (!isValidDate(String(returnDate)) || returnDate <= date) {
        return res.status(400).json({
          success: false,
          error: "Return date must be a valid date after departure date."
        });
      }
    }

    const adultCount = Number(adults);
    const childCount = Number(children);
    const infantCount = Number(infants);
    const passengerCounts = [adultCount, childCount, infantCount];

    if (
      passengerCounts.some(value => !Number.isInteger(value) || value < 0) ||
      adultCount < 1 ||
      adultCount + childCount + infantCount > 9 ||
      infantCount > adultCount
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid passenger counts. At least one adult is required, with no more than nine passengers and no more infants than adults."
      });
    }

    const cabinMap = {
      economy: "Economy",
      premiumeconomy: "PremiumEconomy",
      business: "Business",
      first: "First"
    };

    const cabin = cabinMap[String(travelClass).replace(/\s/g, "").toLowerCase()];

    if (!cabin) {
      return res.status(400).json({
        success: false,
        error: "Invalid travel class. Use Economy, PremiumEconomy, Business or First."
      });
    }

    const accessToken = await getTravelportToken();
    if (!accessToken) {
      throw new Error("Travelport access token was not returned.");
    }
    const searchCriteriaFlight = [
      {
        "@type": "SearchCriteriaFlight",
        departureDate: String(date),
        From: { value: originCode },
        To: { value: destinationCode }
      }
    ];

    if (returnDate) {
      searchCriteriaFlight.push({
        "@type": "SearchCriteriaFlight",
        departureDate: String(returnDate),
        From: { value: destinationCode },
        To: { value: originCode }
      });
    }

    const searchPayload = {
      "@type": "CatalogProductOfferingsQueryRequest",
      CatalogProductOfferingsRequest: {
        "@type": "CatalogProductOfferingsRequestAir",
        contentSourceList: ["GDS", "NDC"],
        offersPerPage: 50,
        maxNumberOfUpsellsToReturn: 4,
        PassengerCriteria: getPassengerCriteria(
          adultCount,
          childCount,
          infantCount
        ),
        SearchCriteriaFlight: searchCriteriaFlight,
        SearchModifiersAir: {
          "@type": "SearchModifiersAir",
          CabinPreference: [
            {
              "@type": "CabinPreference",
              preferenceType: "Preferred",
              cabins: [cabin]
            }
          ]
        },
        PricingModifiersAir: {
          "@type": "PricingModifiersAir",
          currencyCode: "NGN"
        },
        CustomResponseModifiersAir: {
          "@type": "CustomResponseModifiersAir",
          SearchRepresentation: "Journey"
        }
      }
    };

    const baseUrl = (
      process.env.TRAVELPORT_BASE_URL ||
      (process.env.TRAVELPORT_ENV === "production"
        ? "https://api.travelport.net/11/air"
        : "https://api.pp.travelport.net/11/air")
    ).replace(/\/+$/, "");

    const endpoint = `${baseUrl}/catalog/search/catalogproductofferings`;

    const agent = new https.Agent({
      keepAlive: true,
      rejectUnauthorized: true
    });

    const response = await axios.post(endpoint, searchPayload, {
      httpsAgent: agent,
      timeout: 60000,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Cache-Control": "no-cache",
        "TVP-PCC-Core": process.env.TRAVELPORT_PCC || "7K99_1G",
        TraceId: `ViewTrip_${Date.now()}`
      }
    });

    const normalized = normalizeTravelportResponse(response.data);
    console.log(`Travelport returned ${normalized.offers.length} fare offers.`);

    const gdsErrors = normalized.result?.Error || [];
    const hasNoOffersError = gdsErrors.some(err =>
      err.Message?.includes("NO OFFERS FOUND") || err.SourceCode === "9000"
    );

    if (normalized.offers.length === 0 || hasNoOffersError) {
      return res.status(200).json({
        success: false,
        message: "No available flight found, try modifying the date.",
        provider: "Travelport",
        search: {
          origin: originCode,
          destination: destinationCode,
          departureDate: date,
          returnDate: returnDate || null,
          adults: adultCount,
          children: childCount,
          infants: infantCount,
          cabin
        },
        transactionId: normalized.transactionId,
        identifier: normalized.identifier,
        totalOffers: 0,
        offers: [],
        warnings: normalized.result?.Warning || [],
        errors: gdsErrors
      });
    }

    return res.status(200).json({
      success: true,
      provider: "Travelport",
      search: {
        origin: originCode,
        destination: destinationCode,
        departureDate: date,
        returnDate: returnDate || null,
        adults: adultCount,
        children: childCount,
        infants: infantCount,
        cabin
      },
      transactionId: normalized.transactionId,
      identifier: normalized.identifier,
      totalOffers: normalized.offers.length,
      offers: normalized.offers,
      warnings: normalized.result?.Warning || [],
      errors: gdsErrors
    });

  } catch (error) {
    console.error("STATUS:", error.response?.status);
    console.error("URL:", error.config?.url);
    console.error("RESPONSE:", error.response?.data);
    console.error("MESSAGE:", error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      status: error.response?.status || 500,
      error: error.response?.data || error.message
    });
  }
});
// Travelport AirPrice: reprice a selected cached Search offer before checkout.
// The frontend must send the exact search identifier, CatalogProductOffering ID,
// and Product IDs returned by /api/flight-offers.
app.post("/api/price-offer", async (req, res) => {
  const {
    identifier,
    offeringId,
    productRefs = []
  } = req.body || {};

  if (!identifier || !offeringId || !Array.isArray(productRefs) || productRefs.length === 0) {
    return res.status(400).json({
      success: false,
      error: "identifier, offeringId and at least one productRef are required. Use values from the selected search offer."
    });
  }

  try {
    const accessToken = await getTravelportToken();
    const baseUrl = (
      process.env.TRAVELPORT_BASE_URL ||
      (process.env.TRAVELPORT_ENV === "production"
        ? "https://api.travelport.net/11/air"
        : "https://api.pp.travelport.net/11/air")
    ).replace(/\/+$/, "");

    const productIdentifiers = productRefs
      .filter(ref => typeof ref === "string" && ref.trim())
      .map(ref => ({ Identifier: { value: ref.trim() } }));

    if (productIdentifiers.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid product references were supplied."
      });
    }

    const pricePayload = {
      "@type": "OfferQueryBuildFromCatalogProductOfferings",
      BuildFromCatalogProductOfferingsRequest: {
        "@type": "BuildFromCatalogProductOfferingsRequestAir",
        CatalogProductOfferingsIdentifier: {
          Identifier: { value: String(identifier) }
        },
        CatalogProductOfferingSelection: [
          {
            CatalogProductOfferingIdentifier: {
              Identifier: { value: String(offeringId) }
            },
            ProductIdentifier: productIdentifiers
          }
        ],
        PricingModifiersAir: {
          "@type": "PricingModifiersAir",
          currencyCode: "NGN"
        },
        validateInventoryInd: true
      }
    };

    const endpoint = `${baseUrl}/price/offers/buildfromcatalogproductofferings`;
    const response = await axios.post(endpoint, pricePayload, {
      timeout: 60000,
      httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: true }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "TVP-PCC-Core": process.env.TRAVELPORT_PCC || "7K99_1G",
        TraceId: `ViewTrip_Price_${Date.now()}`
      }
    });

    const priceData = response.data?.OfferListResponse || response.data;
    const pricedOffers = Array.isArray(priceData?.OfferID)
      ? priceData.OfferID
      : priceData?.OfferID
        ? [priceData.OfferID]
        : [];
    const pricedOffer = pricedOffers[0];
    const price = pricedOffer?.Price || {};
    const total = price.TotalPrice ?? null;
    const currency = price.CurrencyCode?.value || null;

    if (total === null || !currency) {
      console.error("Unexpected Travelport AirPrice response:", JSON.stringify(response.data, null, 2));
      return res.status(502).json({
        success: false,
        error: "Travelport did not return a confirmed total price and currency.",
        providerErrors: priceData?.Result?.Error || [],
        providerWarnings: priceData?.Result?.Warning || [],
        rawResponse: response.data
      });
    }

    return res.json({
      success: true,
      provider: "Travelport",
      offerId: pricedOffer.id || null,
      price: {
        currency,
        total: Number(total),
        formatted: `${currency} ${Number(total).toLocaleString("en-GB", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
        base: price.Base ?? null,
        taxes: price.TotalTaxes ?? null,
        fees: price.TotalFees ?? null,
        breakdown: price.PriceBreakdown || []
      },
      warnings: priceData?.Result?.Warning || [],
      errors: priceData?.Result?.Error || [],
      rawResponse: response.data
    });
  } catch (error) {
    console.error("Travelport AirPrice failed:", {
      status: error.response?.status,
      response: error.response?.data,
      message: error.message
    });
    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

// ✅ Send Booking Confirmation Email
app.post("/api/send-booking", async (req, res) => {
  const booking = req.body || {};
  const safeName = escapeHtml(booking.name);
  const safeEmail = escapeHtml(booking.email);
  const safeType = escapeHtml(booking.type);
  const safeItemName = escapeHtml(booking.itemName);

  if (!booking.email || !booking.name || !booking.itemName) {
    return res.status(400).json({
      success: false,
      message: "Name, email and itemName are required."
    });
  }

  console.log("Booking request received for email:", {
    type: booking.type,
    email: booking.email
  });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.mailchannels.net",
      port: Number(process.env.EMAIL_PORT) || 25,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const adminMail = {
      from: `ViewTrip Travels <no-reply@viewtriptravels.com>`,
      to: process.env.EMAIL_RECEIVER,
      subject: `New ${String(booking.type || "").toUpperCase()} Booking from ${String(booking.name || "")}`,
      html: `
        <h2>New Booking Received</h2>
        <p><b>Name:</b> ${safeName}</p>
        <p><b>Email:</b> ${safeEmail}</p>
        <p><b>Type:</b> ${safeType}</p>
        <p><b>Item:</b> ${safeItemName}</p>
      `,
    };

    const customerMail = {
      from: `ViewTrip Travels <no-reply@viewtriptravels.com>`,
      to: booking.email,
      subject: `✅ Booking Confirmation - ViewTrip Travels`,
      html: `
        <h2>Dear ${safeName},</h2>
        <p>Thank you for booking your <b>${safeType}</b> with <b>ViewTrip Travels</b>!</p>
        <p>We have received your request for:</p>
        <p><b>${safeItemName}</b></p>
        <p>Our team will reach out shortly.</p>
        <br/>
        <p>Warm regards,<br/>ViewTrip Travels Team</p>
      `,
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(customerMail);

    res.status(200).json({
      success: true,
      message: "Booking emails sent successfully!"
    });

  } catch (error) {
    console.error("❌ Email Error:", error);
    res.status(500).json({ message: "Failed to send booking emails" });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));