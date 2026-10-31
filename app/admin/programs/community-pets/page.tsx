import {
  getAllAnimals,
  getAllAnimalExpenses,
  getAllSponsorships,
} from "@/app/lib/db";
import { isGivebutterConfigured } from "@/app/lib/givebutter";
import CommunityPetTabs from "./CommunityPetTabs";

export default async function AdminCommunityPetsPage() {
  const [animals, expenses, sponsorships, givebutterConfigured] =
    await Promise.all([
      getAllAnimals(),
      getAllAnimalExpenses(),
      getAllSponsorships(),
      isGivebutterConfigured(),
    ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Sponsor a Pet Program</h1>
      <CommunityPetTabs
        animals={animals}
        expenses={expenses}
        sponsorships={sponsorships}
        givebutterConfigured={givebutterConfigured}
      />
    </div>
  );
}
