/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as artifactBackfill from "../artifactBackfill.js";
import type * as artifactContent from "../artifactContent.js";
import type * as attachmentMarkdown from "../attachmentMarkdown.js";
import type * as autumn from "../autumn.js";
import type * as axiom from "../axiom.js";
import type * as braintrust from "../braintrust.js";
import type * as braintrustContext from "../braintrustContext.js";
import type * as cleanup from "../cleanup.js";
import type * as clerk from "../clerk.js";
import type * as compaction from "../compaction.js";
import type * as composerGates from "../composerGates.js";
import type * as crons from "../crons.js";
import type * as deployment from "../deployment.js";
import type * as documents from "../documents.js";
import type * as email from "../email.js";
import type * as emails_platinumInvite from "../emails/platinumInvite.js";
import type * as features from "../features.js";
import type * as folders from "../folders.js";
import type * as funnel from "../funnel.js";
import type * as historySearch from "../historySearch.js";
import type * as homeSuggestions from "../homeSuggestions.js";
import type * as html from "../html.js";
import type * as http from "../http.js";
import type * as imageWorker from "../imageWorker.js";
import type * as inference from "../inference.js";
import type * as inference_askQuestion from "../inference/askQuestion.js";
import type * as inference_attachments from "../inference/attachments.js";
import type * as inference_bestEffort from "../inference/bestEffort.js";
import type * as inference_billing from "../inference/billing.js";
import type * as inference_chart from "../inference/chart.js";
import type * as inference_designTasteSkill from "../inference/designTasteSkill.js";
import type * as inference_documents from "../inference/documents.js";
import type * as inference_finalize from "../inference/finalize.js";
import type * as inference_generateImage from "../inference/generateImage.js";
import type * as inference_historySearch from "../inference/historySearch.js";
import type * as inference_html from "../inference/html.js";
import type * as inference_htmlTheme from "../inference/htmlTheme.js";
import type * as inference_image from "../inference/image.js";
import type * as inference_math from "../inference/math.js";
import type * as inference_memory from "../inference/memory.js";
import type * as inference_mutationQueue from "../inference/mutationQueue.js";
import type * as inference_openMeteo from "../inference/openMeteo.js";
import type * as inference_reactArtifact from "../inference/reactArtifact.js";
import type * as inference_reasoningReplay from "../inference/reasoningReplay.js";
import type * as inference_replyRepair from "../inference/replyRepair.js";
import type * as inference_search from "../inference/search.js";
import type * as inference_stepOutput from "../inference/stepOutput.js";
import type * as inference_stream from "../inference/stream.js";
import type * as inference_textMatch from "../inference/textMatch.js";
import type * as inference_titleRegen from "../inference/titleRegen.js";
import type * as inference_titles from "../inference/titles.js";
import type * as inference_toolPolicy from "../inference/toolPolicy.js";
import type * as inference_turnUsage from "../inference/turnUsage.js";
import type * as inference_weather from "../inference/weather.js";
import type * as inference_webFetch from "../inference/webFetch.js";
import type * as kirkify from "../kirkify.js";
import type * as kirkify_aspect from "../kirkify/aspect.js";
import type * as kirkify_limits from "../kirkify/limits.js";
import type * as kirkify_prompt from "../kirkify/prompt.js";
import type * as kirkify_references from "../kirkify/references.js";
import type * as lockedInference from "../lockedInference.js";
import type * as lockedPolicy from "../lockedPolicy.js";
import type * as lockedThreads from "../lockedThreads.js";
import type * as memory from "../memory.js";
import type * as memoryIndex from "../memoryIndex.js";
import type * as messageQueue from "../messageQueue.js";
import type * as messages from "../messages.js";
import type * as modelFavorites from "../modelFavorites.js";
import type * as models from "../models.js";
import type * as performance from "../performance.js";
import type * as platinum from "../platinum.js";
import type * as posthog from "../posthog.js";
import type * as preferences from "../preferences.js";
import type * as prompts from "../prompts.js";
import type * as serverLoad from "../serverLoad.js";
import type * as shareLinks from "../shareLinks.js";
import type * as site from "../site.js";
import type * as slotActions from "../slotActions.js";
import type * as slotCodes from "../slotCodes.js";
import type * as slotRewards from "../slotRewards.js";
import type * as slots from "../slots.js";
import type * as slots_billing from "../slots/billing.js";
import type * as slots_catalog from "../slots/catalog.js";
import type * as slots_guest from "../slots/guest.js";
import type * as slots_tables from "../slots/tables.js";
import type * as streamFlush from "../streamFlush.js";
import type * as streamWatchdog from "../streamWatchdog.js";
import type * as suggestions_context from "../suggestions/context.js";
import type * as suggestions_fallbacks from "../suggestions/fallbacks.js";
import type * as suggestions_generate from "../suggestions/generate.js";
import type * as suggestions_parse from "../suggestions/parse.js";
import type * as suggestions_prompt from "../suggestions/prompt.js";
import type * as suggestions_random from "../suggestions/random.js";
import type * as suggestions_text from "../suggestions/text.js";
import type * as suggestions_types from "../suggestions/types.js";
import type * as supermemory from "../supermemory.js";
import type * as supermemoryManage from "../supermemoryManage.js";
import type * as supermemorySearch from "../supermemorySearch.js";
import type * as support_account from "../support/account.js";
import type * as support_guard from "../support/guard.js";
import type * as support_labels from "../support/labels.js";
import type * as support_refunds from "../support/refunds.js";
import type * as support_replies from "../support/replies.js";
import type * as support_usage from "../support/usage.js";
import type * as threadCompaction from "../threadCompaction.js";
import type * as threads from "../threads.js";
import type * as transcription from "../transcription.js";
import type * as turns from "../turns.js";
import type * as usageLedger from "../usageLedger.js";
import type * as userContext from "../userContext.js";
import type * as userMemory from "../userMemory.js";
import type * as validators from "../validators.js";
import type * as zeroRetention from "../zeroRetention.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  artifactBackfill: typeof artifactBackfill;
  artifactContent: typeof artifactContent;
  attachmentMarkdown: typeof attachmentMarkdown;
  autumn: typeof autumn;
  axiom: typeof axiom;
  braintrust: typeof braintrust;
  braintrustContext: typeof braintrustContext;
  cleanup: typeof cleanup;
  clerk: typeof clerk;
  compaction: typeof compaction;
  composerGates: typeof composerGates;
  crons: typeof crons;
  deployment: typeof deployment;
  documents: typeof documents;
  email: typeof email;
  "emails/platinumInvite": typeof emails_platinumInvite;
  features: typeof features;
  folders: typeof folders;
  funnel: typeof funnel;
  historySearch: typeof historySearch;
  homeSuggestions: typeof homeSuggestions;
  html: typeof html;
  http: typeof http;
  imageWorker: typeof imageWorker;
  inference: typeof inference;
  "inference/askQuestion": typeof inference_askQuestion;
  "inference/attachments": typeof inference_attachments;
  "inference/bestEffort": typeof inference_bestEffort;
  "inference/billing": typeof inference_billing;
  "inference/chart": typeof inference_chart;
  "inference/designTasteSkill": typeof inference_designTasteSkill;
  "inference/documents": typeof inference_documents;
  "inference/finalize": typeof inference_finalize;
  "inference/generateImage": typeof inference_generateImage;
  "inference/historySearch": typeof inference_historySearch;
  "inference/html": typeof inference_html;
  "inference/htmlTheme": typeof inference_htmlTheme;
  "inference/image": typeof inference_image;
  "inference/math": typeof inference_math;
  "inference/memory": typeof inference_memory;
  "inference/mutationQueue": typeof inference_mutationQueue;
  "inference/openMeteo": typeof inference_openMeteo;
  "inference/reactArtifact": typeof inference_reactArtifact;
  "inference/reasoningReplay": typeof inference_reasoningReplay;
  "inference/replyRepair": typeof inference_replyRepair;
  "inference/search": typeof inference_search;
  "inference/stepOutput": typeof inference_stepOutput;
  "inference/stream": typeof inference_stream;
  "inference/textMatch": typeof inference_textMatch;
  "inference/titleRegen": typeof inference_titleRegen;
  "inference/titles": typeof inference_titles;
  "inference/toolPolicy": typeof inference_toolPolicy;
  "inference/turnUsage": typeof inference_turnUsage;
  "inference/weather": typeof inference_weather;
  "inference/webFetch": typeof inference_webFetch;
  kirkify: typeof kirkify;
  "kirkify/aspect": typeof kirkify_aspect;
  "kirkify/limits": typeof kirkify_limits;
  "kirkify/prompt": typeof kirkify_prompt;
  "kirkify/references": typeof kirkify_references;
  lockedInference: typeof lockedInference;
  lockedPolicy: typeof lockedPolicy;
  lockedThreads: typeof lockedThreads;
  memory: typeof memory;
  memoryIndex: typeof memoryIndex;
  messageQueue: typeof messageQueue;
  messages: typeof messages;
  modelFavorites: typeof modelFavorites;
  models: typeof models;
  performance: typeof performance;
  platinum: typeof platinum;
  posthog: typeof posthog;
  preferences: typeof preferences;
  prompts: typeof prompts;
  serverLoad: typeof serverLoad;
  shareLinks: typeof shareLinks;
  site: typeof site;
  slotActions: typeof slotActions;
  slotCodes: typeof slotCodes;
  slotRewards: typeof slotRewards;
  slots: typeof slots;
  "slots/billing": typeof slots_billing;
  "slots/catalog": typeof slots_catalog;
  "slots/guest": typeof slots_guest;
  "slots/tables": typeof slots_tables;
  streamFlush: typeof streamFlush;
  streamWatchdog: typeof streamWatchdog;
  "suggestions/context": typeof suggestions_context;
  "suggestions/fallbacks": typeof suggestions_fallbacks;
  "suggestions/generate": typeof suggestions_generate;
  "suggestions/parse": typeof suggestions_parse;
  "suggestions/prompt": typeof suggestions_prompt;
  "suggestions/random": typeof suggestions_random;
  "suggestions/text": typeof suggestions_text;
  "suggestions/types": typeof suggestions_types;
  supermemory: typeof supermemory;
  supermemoryManage: typeof supermemoryManage;
  supermemorySearch: typeof supermemorySearch;
  "support/account": typeof support_account;
  "support/guard": typeof support_guard;
  "support/labels": typeof support_labels;
  "support/refunds": typeof support_refunds;
  "support/replies": typeof support_replies;
  "support/usage": typeof support_usage;
  threadCompaction: typeof threadCompaction;
  threads: typeof threads;
  transcription: typeof transcription;
  turns: typeof turns;
  usageLedger: typeof usageLedger;
  userContext: typeof userContext;
  userMemory: typeof userMemory;
  validators: typeof validators;
  zeroRetention: typeof zeroRetention;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  persistentTextStreaming: import("@convex-dev/persistent-text-streaming/_generated/component.js").ComponentApi<"persistentTextStreaming">;
  autumn: import("@useautumn/convex/_generated/component.js").ComponentApi<"autumn">;
};
