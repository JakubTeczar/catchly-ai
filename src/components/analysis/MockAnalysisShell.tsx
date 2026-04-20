"use client";

import type { AnalysisState, PopupData } from "@/types/analysis";
import { SectionWrapper } from "./SectionWrapper";
import { ScreenshotSection } from "./ScreenshotSection";
import { StyleSection } from "./StyleSection";
import { SubpagesSection } from "./SubpagesSection";
import { LeadToolsSection } from "./LeadToolsSection";
import { PopupSection } from "./PopupSection";
import { OfferSection } from "./OfferSection";
import { DownloadPDFButton } from "./DownloadPDFButton";

interface Props {
  state: AnalysisState;
  popupData: PopupData;
}

export function MockAnalysisShell({ state, popupData }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <DownloadPDFButton analysisId={state.id} />
      </div>
      <SectionWrapper visible={true} ready={true}>
        <ScreenshotSection screenshotUrl={state.screenshotUrl} done={true} allDone={true} url={state.url} />
      </SectionWrapper>

      <SectionWrapper visible={true} ready={true}>
        <StyleSection styleData={state.styleData} done={true} />
      </SectionWrapper>

      <SectionWrapper visible={true} ready={true}>
        <SubpagesSection subpagesData={state.subpagesData} done={true} />
      </SectionWrapper>

      <SectionWrapper visible={true} ready={true}>
        <LeadToolsSection leadToolsData={state.leadToolsData} done={true} />
      </SectionWrapper>

      <SectionWrapper visible={true} ready={true}>
        <PopupSection data={popupData} screenshotUrl={state.screenshotUrl} leadToolsData={state.leadToolsData} />
      </SectionWrapper>

      <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.07)" }} />

      <SectionWrapper visible={true} ready={true}>
        <OfferSection analysisId={state.id} websiteUrl={state.url} />
      </SectionWrapper>
    </div>
  );
}
