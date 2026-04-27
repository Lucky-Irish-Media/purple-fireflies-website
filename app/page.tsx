export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-zinc-900">
      <main className="flex flex-col items-center gap-8 px-4 py-32 text-center max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Purple Fireflies
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </main>
    </div>
  );
}
