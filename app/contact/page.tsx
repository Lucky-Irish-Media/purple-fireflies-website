export default function Contact() {
  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <main className="flex flex-col items-center gap-12 px-4 py-32 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Contact Us
        </h1>
        <p className="text-lg leading-8 text-text-secondary">
          Have questions or want to get involved? Reach out to us using the information below.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Email</h2>
            <a
              href="mailto:hello@purplefireflies.org"
              className="text-lg text-[#6800AB] hover:underline"
            >
              hello@purplefireflies.org
            </a>
          </div>
          <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Phone</h2>
            <a
              href="tel:+1234567890"
              className="text-lg text-[#6800AB] hover:underline"
            >
              (123) 456-7890
            </a>
          </div>
          <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-sm md:col-span-2">
            <h2 className="text-xl font-semibold text-foreground">Address</h2>
            <p className="text-lg text-text-secondary">
              123 Main Street<br />
              Suite 100<br />
              Your City, State 12345
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
