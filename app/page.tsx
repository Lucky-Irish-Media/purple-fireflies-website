export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-background font-sans">
      <main className="flex flex-col items-center gap-8 px-4 py-32 text-center max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Mission Statement
        </h1>
        <p className="text-lg leading-8 text-text-secondary">
          Our mission is to foster an inclusive community where everyone feels safe, respected, and empowered to thrive. We embrace the diversity that strengthens us and work collaboratively with grassroots leaders to inspire action, inform our neighbors, and create meaningful, lasting change.
        </p>
      </main>
    </div>
  );
}
