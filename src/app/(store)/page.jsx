export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-6 px-6">
      <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
        New drop every Friday
      </span>

      <h1 className="font-display text-6xl md:text-8xl font-bold text-center leading-none">
        Drop<span className="text-accent">Zone</span>
      </h1>

      <p className="text-neutral-500 dark:text-neutral-400 text-lg text-center max-w-md">
        Limited runs. No restocks. If you know, you know.
      </p>

      <button className="mt-4 px-8 py-3 bg-accent text-neutral-950 font-semibold rounded-full hover:bg-accent-dark transition-colors">
        See this week's drop
      </button>
    </section>
  );
}
