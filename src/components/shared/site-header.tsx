import { Logo } from "@/components/shared/logo";
import { TopUtilityBar } from "@/components/shared/header/top-utility-bar";
import { MainNav } from "@/components/shared/header/main-nav";
import { MobileNav } from "@/components/shared/header/mobile-nav";
import { HeaderActions } from "@/components/shared/header/header-actions";

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <TopUtilityBar />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Logo />
        </div>
        <MainNav />
        <HeaderActions />
      </div>
    </header>
  );
}
