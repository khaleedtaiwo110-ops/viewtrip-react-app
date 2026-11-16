
export default function TripRecommendation({ trip }) {
  const formatPrice = amount =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-3 bg-white">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h3 className="font-bold text-lg">{trip.name}</h3>
          <p className="text-gray-500 text-sm">{trip.country}</p>
        </div>

        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          Within budget
        </span>
      </div>

      <p className="text-sm text-gray-600 my-3">
        {trip.description}
      </p>

      <p className="font-bold text-blue-700 text-lg">
        {formatPrice(trip.estimatedCost.total)}
      </p>

      <p className="text-xs text-gray-500 mt-1">
        Estimated land expenses · Flights excluded
      </p>

      <div className="mt-3 border-t pt-3 text-sm space-y-1">
        <p>Accommodation: {formatPrice(trip.estimatedCost.accommodation)}</p>
        <p>Food: {formatPrice(trip.estimatedCost.food)}</p>
        <p>Activities: {formatPrice(trip.estimatedCost.activities)}</p>
        <p>Local transport: {formatPrice(trip.estimatedCost.localTransport)}</p>
      </div>
    </div>
  );
}
