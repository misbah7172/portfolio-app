import { NavigationButtons } from "./NavigationButtons";
import { TypeWriter } from "./TypeWriter";

export function HomeContent() {
  return (
    <div className="flex w-full max-w-4xl flex-col space-y-6">
      <TypeWriter
        text="Hi, I'm MD. Habibullah Misbah"
        className="text-4xl font-bold text-slate-200"
      />
      <p className="text-xl text-slate-400">
        Full Stack Developer specializing in modern web applications. I craft
        elegant solutions using Next.js, TypeScript, and cutting-edge
        technologies.
      </p>
      <p className="text-lg text-slate-400">
        I believe that great software is born from a combination of technical
        excellence and creative innovation. Let&apos;s build something amazing
        together.
      </p>
      <NavigationButtons />
    </div>
  );
}
