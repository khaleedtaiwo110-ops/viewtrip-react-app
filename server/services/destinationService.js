
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { calculateTripCost } from "./costCalculator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const destinations = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/destinations.json"),
    "utf8"
  )
);

export function recommendDestinations({
  budget,
  days = 5,
  travellers = 1,
  interests = []
}) {
  if (!budget || budget <= 0) return [];

  return destinations
    .map(destination => {
      const cost = calculateTripCost(
        destination,
        days,
        travellers
      );

      const matches = interests.filter(interest =>
        destination.categories.includes(
          interest.toLowerCase()
        )
      ).length;

      return {
        ...destination,
        estimatedCost: cost,
        interestMatches: matches,
        withinBudget: cost.total <= budget
      };
    })
    .filter(destination => destination.withinBudget)
    .sort((a, b) => {
      if (b.interestMatches !== a.interestMatches) {
        return b.interestMatches - a.interestMatches;
      }

      return a.estimatedCost.total - b.estimatedCost.total;
    })
    .slice(0, 5);
}
