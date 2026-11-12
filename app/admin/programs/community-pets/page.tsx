import {
  getAllAnimals,
  getAllAnimalExpenses,
  getAllSponsorships,
  getPetApplications,
} from "@/app/lib/db";
import {
  fetchCampaigns,
  isGivebutterConfigured,
} from "@/app/lib/givebutter";
import CommunityPetTabs from "./CommunityPetTabs";

export default async function AdminCommunityPetsPage() {
  const [animals, expenses, sponsorships, applications] = await Promise.all([
    getAllAnimals(),
    getAllAnimalExpenses(),
    getAllSponsorships(),
    getPetApplications(),
  ]);

  const givebutterConfigured = await isGivebutterConfigured();

  let verifiedCampaignCodes: string[] = [];
  if (givebutterConfigured) {
    try {
      verifiedCampaignCodes = (await fetchCampaigns()).map((campaign) =>
        campaign.code.trim().toUpperCase(),
      );
    } catch {
      verifiedCampaignCodes = [];
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Sponsor a Pet Program</h1>
      <CommunityPetTabs
        animals={animals}
        expenses={expenses}
        sponsorships={sponsorships}
        givebutterConfigured={givebutterConfigured}
        applications={applications}
        verifiedCampaignCodes={verifiedCampaignCodes}
      />
    </div>
  );
}
