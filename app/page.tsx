import Link from "next/link";

export default function Home() {
  const featuredSkills = [
    {
      title: "Semantic Syntax Refiner",
      description:
        "High-fidelity intent extraction from nested JSON structures.",
    },
    {
      title: "Edge VotingBundle",
      description: "Pre-trained routers for real-time object classification.",
    },
    {
      title: "CUDA Conv Mapper",
      description:
        "Dynamic VRAM allocation for heterogeneous GPU clusters.",
    },
    {
      title: "Prompt Injection Shield",
      description: "Continuously learns defensive prompt patterns.",
    },
    {
      title: "Fast-Embed Engine",
      description:
        "Highly optimized embedding generator for 140+ pipelines.",
    },
    {
      title: "Stream-Token Quantizer",
      description: "On-the-fly quantization for post-training LLMs.",
    },
  ];

  return (
    <main className="bg-white text-[#0f1222]">
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pt-8 pb-20">
        <div
          className="pointer-events-none absolute inset-0 -z-0 bg-[url('/hero-bell-bg.svg')] bg-repeat opacity-[0.12] [background-size:48px_48px]"
          aria-hidden
        />
        <div className="relative z-10">
          <header className="mb-24 flex items-center justify-between">
            <div className="text-xl font-semibold tracking-tight">AlSync</div>
            <nav className="hidden gap-8 text-sm text-[#7a7f93] md:flex">
              <Link href="/explore" className="hover:text-[#0f1222]">
                Explore
              </Link>
              <button
                type="button"
                className="bg-transparent p-0 hover:text-[#0f1222]"
              >
                Sell
              </button>
              <button
                type="button"
                className="bg-transparent p-0 hover:text-[#0f1222]"
              >
                Docs
              </button>
              <button
                type="button"
                className="bg-transparent p-0 hover:text-[#0f1222]"
              >
                Market
              </button>
            </nav>
            <div className="h-8 w-8 rounded-full border border-[#d9dce7]" />
          </header>

          <div className="mx-auto max-w-3xl text-center">
          <p className="mx-auto mb-8 inline-block border border-[#d9dceb] px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-[#5f6785]">
            RETURN INIT SUCCESS
          </p>
          <h1 className="text-5xl font-medium tracking-tight md:text-7xl">
            Collectable
            <br />
            <span className="text-[#1d67ff]">Intelligence.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-[#5c6178]">
            The first marketplace for modular AI kernels. Build your stack with
            portable, executable skills packaged in standardized directory
            structures.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button className="border border-black bg-black px-7 py-3 text-xs font-semibold tracking-[0.2em] text-white">
              LAUNCH TERMINAL
            </button>
            <button className="border border-[#d8dcea] px-7 py-3 text-xs font-semibold tracking-[0.2em] text-[#1e243d]">
              VIEW SOURCE
            </button>
          </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] tracking-[0.26em] text-[#a3a8bd]">
              LATEST UPLOADS
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              Featured Skills
            </h2>
          </div>
          <Link
            className="text-[11px] tracking-[0.16em] text-[#79809a] hover:text-[#0f1222]"
            href="/explore"
          >
            BROWSE ALL REGISTRY
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredSkills.map((skill) => (
            <article
              key={skill.title}
              className="border border-[#eceffa] p-5 transition-shadow hover:shadow-[0_12px_35px_rgba(23,35,73,0.08)]"
            >
              <div className="mb-7 flex items-center justify-between">
                <span className="text-[11px] tracking-[0.18em] text-[#9ba1b8]">
                  PUBLIC
                </span>
                <span className="border border-[#cde0ff] bg-[#f4f8ff] px-2 py-1 text-[9px] font-semibold tracking-[0.18em] text-[#4b7be6]">
                  VERIFIED
                </span>
              </div>
              <h3 className="text-xl font-medium tracking-tight">
                {skill.title}
              </h3>
              <p className="mt-3 min-h-12 text-sm leading-6 text-[#68708a]">
                {skill.description}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-[#eef1f8] pt-4 text-[11px] tracking-[0.14em] text-[#99a0b7]">
                <span>4.2k USES</span>
                <span>v1.7</span>
              </div>
              <button className="mt-5 w-full border border-black bg-black py-2.5 text-xs font-semibold tracking-[0.2em] text-white">
                BUY NOW
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#eef0f8] bg-[#fafbff]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <p className="text-[11px] tracking-[0.24em] text-[#a1a7be]">
              ARCHITECTURE LOG
            </p>
            <h2 className="mt-3 text-5xl font-semibold tracking-tight">
              The Modular Standard
            </h2>
            <p className="mt-6 text-sm leading-7 text-[#616984]">
              Every skill on AlSync follows a strict, developer-first
              structure. No complex but standardized directories that your
              engine can interpret instantly.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-[#25304d]">
              <li>/kernel/core.bin</li>
              <li>/meta/ manifest.json</li>
              <li>/tests/validate.sh</li>
              <li>Built-in benchmarking to ensure performance parity.</li>
            </ul>
          </div>

          <div className="border border-[#e7eaf6] bg-white p-6">
            <p className="mb-4 text-xs tracking-[0.2em] text-[#9aa2ba]">
              {'>'} project-root / ai-skill /
            </p>
            <div className="space-y-2 font-mono text-sm text-[#2f3856]">
              <p>├─ kernel/</p>
              <p>│  └─ core.bin</p>
              <p>
                ├─ <span className="bg-[#f0f6ff] px-2 py-1">skills.md</span>
              </p>
              <p>├─ tests/</p>
              <p>└─ config.json</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="text-5xl font-medium tracking-tight">
          Ready to sync your models?
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-[#616984]">
          Join 12,000+ developers trading high-performance AI modules on the
          global technical registry.
        </p>
        <div className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            className="h-11 flex-1 border border-[#dfe3f1] px-4 text-sm outline-none"
            placeholder="dev@your-domain.io"
          />
          <button className="h-11 border border-black bg-black px-7 text-xs font-semibold tracking-[0.2em] text-white">
            RESERVE_NODE_ID
          </button>
        </div>
      </section>
    </main>
  );
}
