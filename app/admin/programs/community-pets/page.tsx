import {
  getAllAnimals,
  getAllAnimalExpenses,
  getAllSponsorships,
  getPetApplications,
} from "@/app/lib/db";
import { isGivebutterConfigured } from "@/app/lib/givebutter";
import CommunityPetTabs from "./CommunityPetTabs";

export default async function AdminCommunityPetsPage() {
  const [animals, expenses, sponsorships, givebutterConfigured, applications] =
    await Promise.all([
      getAllAnimals(),
      getAllAnimalExpenses(),
      getAllSponsorships(),
      isGivebutterConfigured(),
      getPetApplications(),
    ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Sponsor a Pet Program</h1>
      <CommunityPetTabs
        animals={animals}
        expenses={expenses}
        sponsorships={sponsorships}
        givebutterConfigured={givebutterConfigured}
        applications={applications}
      />
    </div>
  );
}
