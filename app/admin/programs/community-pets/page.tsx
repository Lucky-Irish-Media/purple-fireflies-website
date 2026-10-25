import {
  getAllAnimals,
  getAllAnimalExpenses,
  getAllSponsorships,
} from "@/app/lib/db";
import CommunityPetTabs from "./CommunityPetTabs";

export default async function AdminCommunityPetsPage() {
  const [animals, expenses, sponsorships] = await Promise.all([
    getAllAnimals(),
    getAllAnimalExpenses(),
    getAllSponsorships(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Community Pet Fund</h1>
      <CommunityPetTabs
        animals={animals}
        expenses={expenses}
        sponsorships={sponsorships}
      />
    </div>
  );
}
