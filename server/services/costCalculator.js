
export function calculateTripCost(destination, days, travellers) {
  const dailyCost = destination.estimatedDailyCostPerPersonNGN;

  const accommodation =
    dailyCost * 0.45 * days * travellers;

  const food =
    dailyCost * 0.25 * days * travellers;

  const activities =
    dailyCost * 0.20 * days * travellers;

  const localTransport =
    dailyCost * 0.10 * days * travellers;

  const total =
    accommodation + food + activities + localTransport;

  return {
    accommodation: Math.round(accommodation),
    food: Math.round(food),
    activities: Math.round(activities),
    localTransport: Math.round(localTransport),
    total: Math.round(total),
    flightsIncluded: false,
    isEstimate: true
  };
}
