export default function Contact() {
  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <main className="flex flex-col items-center gap-12 px-4 py-32 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Get Involved
        </h1>
        <p className="text-lg leading-8 text-text-secondary">
          Want to get involved with Purple Fireflies? Reach out using one of the methods below.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Email Us</h2>
            <a
              href="mailto:aca_ohio@proton.me"
              className="text-lg text-[#6800AB] hover:underline"
            >
              aca_ohio@proton.me
            </a>
            <p className="text-sm text-text-secondary">
              Send us an email to learn more about getting involved
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Fill Out Our Form</h2>
            <a
              href="https://cloud.disroot.org/apps/forms/s/BrnnRYnrxZJyd6it9HE4M399"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-[#6800AB] hover:underline"
            >
              Request to Get Involved
            </a>
            <p className="text-sm text-text-secondary">
              Complete our form to request involvement opportunities
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
