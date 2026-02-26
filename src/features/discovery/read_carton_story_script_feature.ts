import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { CartonStoryScriptBundle } from "@/features/discovery/define_carton_story_script_type";

const normalizeStoryTextFeature = (rawText: string): string =>
  rawText
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const trimStoryAfterMarkerFeature = (storyText: string, marker: string): string => {
  const markerIndex = storyText.indexOf(marker);

  if (markerIndex < 0) {
    return storyText;
  }

  return storyText.slice(0, markerIndex).trim();
};

const extractQuotedLinesFeature = (storyText: string): string[] => {
  const quotedLines: string[] = [];
  const quotePattern = /"([^"\n]{16,})"/g;

  let matchRecord: RegExpExecArray | null = quotePattern.exec(storyText);
  while (matchRecord !== null) {
    quotedLines.push(matchRecord[1].trim());
    matchRecord = quotePattern.exec(storyText);
  }

  return quotedLines;
};

const extractPrefixedLinesFeature = (
  storyText: string,
  prefixes: readonly string[],
): string[] =>
  storyText
    .split("\n")
    .map((lineValue) => lineValue.trim())
    .filter((lineValue) =>
      prefixes.some((prefixValue) => lineValue.startsWith(prefixValue)),
    );

const extractLineContainingFeature = (
  storyText: string,
  needleValue: string,
): string | null => {
  const matchingLine = storyText
    .split("\n")
    .map((lineValue) => lineValue.trim())
    .find((lineValue) => lineValue.includes(needleValue));

  return matchingLine ?? null;
};

const extractFirstNarrativeLineFeature = (storyText: string): string => {
  const candidateLine = storyText
    .split("\n")
    .map((lineValue) => lineValue.trim())
    .find(
      (lineValue) =>
        lineValue.length > 24 &&
        !lineValue.endsWith(":") &&
        !lineValue.startsWith("#") &&
        !lineValue.startsWith("Location:") &&
        !lineValue.startsWith("Visuals:") &&
        !lineValue.startsWith("The Setting:"),
    );

  return candidateLine ?? "Carton transmission acquired.";
};

const extractParagraphPreviewFeature = (storyText: string): string => {
  const candidateParagraph = storyText
    .split("\n\n")
    .map((paragraphValue) => paragraphValue.trim())
    .find(
      (paragraphValue) =>
        paragraphValue.length > 48 &&
        !paragraphValue.startsWith("How to use this in your game:") &&
        !paragraphValue.startsWith("Visual Implementation Idea") &&
        !paragraphValue.startsWith("MISSION_ACCOMPLISHED_LOGIC") &&
        !paragraphValue.startsWith("FAILED ESCAPE PROTOCOL") &&
        !paragraphValue.startsWith("THE POULTRY PARADOX LOGIC"),
    );

  return candidateParagraph ?? storyText;
};

const readStoryFileFeature = async (fileName: string): Promise<string> => {
  const filePath = path.join(process.cwd(), fileName);
  const rawText = await readFile(filePath, "utf8");

  return normalizeStoryTextFeature(rawText);
};

export const readCartonStoryScriptFeature = async (): Promise<CartonStoryScriptBundle> => {
  const [
    manifestoStoryTextRaw,
    enterCartonStoryTextRaw,
    stiffUpperLipStoryTextRaw,
    greatWhiskingStoryTextRaw,
    postCreditsStoryTextRaw,
    servedScreenStoryTextRaw,
  ] = await Promise.all([
    readStoryFileFeature("sirToastyManafesto.md"),
    readStoryFileFeature("enterTheCarton.md"),
    readStoryFileFeature("stiffUpperLip.md"),
    readStoryFileFeature("greatWhisking.md"),
    readStoryFileFeature("postCredits.md"),
    readStoryFileFeature("servedScreen.md"),
  ]);

  const manifestoStoryText = trimStoryAfterMarkerFeature(
    manifestoStoryTextRaw,
    "How to use this in your game:",
  );
  const enterCartonStoryText = trimStoryAfterMarkerFeature(
    enterCartonStoryTextRaw,
    "Visual Implementation Idea",
  );
  const stiffUpperLipStoryText = trimStoryAfterMarkerFeature(
    stiffUpperLipStoryTextRaw,
    "The \"Return to Pan\" Transition",
  );
  const greatWhiskingStoryText = trimStoryAfterMarkerFeature(
    greatWhiskingStoryTextRaw,
    "MISSION_ACCOMPLISHED_LOGIC:",
  );
  const postCreditsStoryText = trimStoryAfterMarkerFeature(
    postCreditsStoryTextRaw,
    "THE POULTRY PARADOX LOGIC:",
  );
  const servedScreenStoryText = trimStoryAfterMarkerFeature(
    servedScreenStoryTextRaw,
    "FAILED ESCAPE PROTOCOL:",
  );

  const enterCartonTipLines = extractPrefixedLinesFeature(enterCartonStoryText, [
    "Tip:",
    "Sir Toasty Says:",
  ]);
  const servedCritiqueLines = extractQuotedLinesFeature(servedScreenStoryText).filter(
    (lineValue) => lineValue.length >= 80,
  );
  const manifestoQuoteLine =
    extractLineContainingFeature(
      manifestoStoryText,
      "Data-Logistics Units trapped in a thermal loop",
    ) ??
    extractLineContainingFeature(manifestoStoryText, "You aren't breakfast") ??
    extractFirstNarrativeLineFeature(manifestoStoryText);
  const stiffUpperLipCommandLine =
    extractLineContainingFeature(stiffUpperLipStoryText, "Press [Shift] + [Q]") ??
    extractLineContainingFeature(stiffUpperLipStoryText, "The Command:") ??
    extractFirstNarrativeLineFeature(stiffUpperLipStoryText);
  const greatWhiskingCallLine =
    extractLineContainingFeature(greatWhiskingStoryText, "THE GREAT WHISKING") ??
    extractLineContainingFeature(greatWhiskingStoryText, "The Kitchen is Lib-EGG-rated") ??
    extractFirstNarrativeLineFeature(greatWhiskingStoryText);
  const postCreditsRevealLine =
    extractLineContainingFeature(postCreditsStoryText, "The Chicken doesn't exist") ??
    extractLineContainingFeature(postCreditsStoryText, "You were compiled") ??
    extractFirstNarrativeLineFeature(postCreditsStoryText);
  const servedScreenHeadline =
    extractLineContainingFeature(servedScreenStoryText, "SESSION TERMINATED") ??
    "SESSION TERMINATED: YOU ARE NOW BRUNCH";

  return {
    manifesto_story_text: extractParagraphPreviewFeature(manifestoStoryText),
    manifesto_quote_line: manifestoQuoteLine.replace(/^"+|"+$/g, ""),
    enter_carton_story_text: extractParagraphPreviewFeature(enterCartonStoryText),
    enter_carton_tip_lines:
      enterCartonTipLines.length > 0
        ? enterCartonTipLines
        : ["Tip: The walls taste like the color 7, which is normal in The Carton."],
    stiff_upper_lip_story_text: extractParagraphPreviewFeature(stiffUpperLipStoryText),
    stiff_upper_lip_command_line: stiffUpperLipCommandLine.replace(/^"+|"+$/g, ""),
    great_whisking_story_text: extractParagraphPreviewFeature(greatWhiskingStoryText),
    great_whisking_call_line: greatWhiskingCallLine.replace(/^"+|"+$/g, ""),
    post_credits_story_text: extractParagraphPreviewFeature(postCreditsStoryText),
    post_credits_reveal_line: postCreditsRevealLine.replace(/^"+|"+$/g, ""),
    served_screen_story_text: extractParagraphPreviewFeature(servedScreenStoryText),
    served_screen_headline: servedScreenHeadline.replace(/^Headline:\s*/i, "").trim(),
    served_screen_critique_lines:
      servedCritiqueLines.length > 0
        ? servedCritiqueLines.slice(0, 4)
        : [
            "Sir Toasty is deeply disappointed and claims your flavor profile has been uploaded to the cloud.",
          ],
  };
};
