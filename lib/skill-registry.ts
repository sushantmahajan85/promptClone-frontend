export type SkillRecord = {
  routeId: string;
  displayId: string;
  catalogId: string;
  categoryPack: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  author: string;
  authorDisplay: string;
  size: string;
  avatar: string;
  version: string;
  lastSync: string;
  computePerReq: string;
  globalInstalls: string;
  /** Agent platforms this skill is validated for (e.g. Claude, GPT-4o). */
  supportedAgents: string[];
};

export const SKILLS: SkillRecord[] = [
  {
    routeId: "0X142A",
    displayId: "#0X142A",
    catalogId: "CS_LOGIC_001",
    categoryPack: "LOGIC_PACKS",
    title: "Vector Architect",
    shortDescription:
      "High-dimensional embedding orchestration for retrieval pipelines and semantic routing clusters.",
    longDescription:
      "Orchestrates high-dimensional embeddings for retrieval and routing with deterministic batching, cache-aware fanout, and stable vector contracts across environments.",
    tags: ["NEURAL", "LOGIC"],
    author: "@ARCH_DEV",
    authorDisplay: "Synthetix_Dev",
    size: "1.2 MB",
    avatar: "#2563eb",
    version: "v1.0.42",
    lastSync: "2m ago",
    computePerReq: "$0.002/req",
    globalInstalls: "12.4k",
    supportedAgents: ["Claude", "GPT-4o", "Gemini", "Mistral"],
  },
  {
    routeId: "0X8F21",
    displayId: "#0X8F21",
    catalogId: "CS_VISION_002",
    categoryPack: "VISION_PACKS",
    title: "Ocular Core V4",
    shortDescription:
      "Edge-optimized vision kernels with sub-10ms inference on constrained hardware targets.",
    longDescription:
      "Production-grade vision stack for detection and segmentation with ONNX/TensorRT export paths and edge-first latency budgets.",
    tags: ["VISION", "EDGE"],
    author: "@NULL_PTR",
    authorDisplay: "NullPtr_Labs",
    size: "890 KB",
    avatar: "#dc2626",
    version: "v4.2.1",
    lastSync: "5m ago",
    computePerReq: "$0.003/req",
    globalInstalls: "8.1k",
    supportedAgents: ["GPT-4o", "Gemini", "Claude"],
  },
  {
    routeId: "0X3C9E",
    displayId: "#0X3C9E",
    catalogId: "CS_NLP_003",
    categoryPack: "LOGIC_PACKS",
    title: "Syntax Refiner",
    shortDescription:
      "Deterministic JSON repair and schema validation for agent output streams.",
    longDescription:
      "Strict schema enforcement and streaming repair for agent outputs—ideal for tool-calling pipelines and contract-safe APIs.",
    tags: ["NLP", "JSON"],
    author: "@SCHEMA_LAB",
    authorDisplay: "Schema_Lab",
    size: "420 KB",
    avatar: "#16a34a",
    version: "v1.2.8",
    lastSync: "12m ago",
    computePerReq: "$0.001/req",
    globalInstalls: "21.0k",
    supportedAgents: ["Claude", "GPT-4o", "Gemini", "Grok"],
  },
  {
    routeId: "0X7B44",
    displayId: "#0X7B44",
    catalogId: "CS_CUDA_004",
    categoryPack: "PERF_PACKS",
    title: "CUDA Conv Mapper",
    shortDescription:
      "VRAM-aware kernel tiling for heterogeneous multi-GPU inference workloads.",
    longDescription:
      "Maps convolution workloads across heterogeneous GPUs with VRAM-aware tiling and deterministic batch shapes for throughput.",
    tags: ["CUDA", "PERF"],
    author: "@GPU_STACK",
    authorDisplay: "GPU_Stack",
    size: "2.1 MB",
    avatar: "#7c3aed",
    version: "v2.0.0",
    lastSync: "1h ago",
    computePerReq: "$0.008/req",
    globalInstalls: "4.3k",
    supportedAgents: ["GPT-4o", "Claude"],
  },
  {
    routeId: "0X1D90",
    displayId: "#0X1D90",
    catalogId: "CS_SAFE_005",
    categoryPack: "LOGIC_PACKS",
    title: "Prompt Shield v2",
    shortDescription:
      "Runtime injection detection with adaptive policy layers for public endpoints.",
    longDescription:
      "Adaptive guardrails for public agent endpoints with policy layers, telemetry hooks, and low-overhead scoring.",
    tags: ["SAFETY", "LLM"],
    author: "@SEC_NODE",
    authorDisplay: "Sec_Node",
    size: "640 KB",
    avatar: "#ea580c",
    version: "v2.4.0",
    lastSync: "8m ago",
    computePerReq: "$0.004/req",
    globalInstalls: "15.2k",
    supportedAgents: ["Claude", "GPT-4o", "Gemini", "Mistral"],
  },
  {
    routeId: "0X5E67",
    displayId: "#0X5E67",
    catalogId: "CS_EMBED_006",
    categoryPack: "LOGIC_PACKS",
    title: "Fast-Embed Engine",
    shortDescription:
      "Quantized embedding generator tuned for 140+ downstream pipelines out of the box.",
    longDescription:
      "High-throughput embedding generation with quantization presets validated across 140+ downstream retrieval pipelines.",
    tags: ["EMBED", "SPEED"],
    author: "@LATENCY_X",
    authorDisplay: "Latency_X",
    size: "1.8 MB",
    avatar: "#0891b2",
    version: "v1.8.3",
    lastSync: "3m ago",
    computePerReq: "$0.002/req",
    globalInstalls: "19.7k",
    supportedAgents: ["GPT-4o", "Gemini", "Claude"],
  },
  {
    routeId: "0X9A12",
    displayId: "#0X9A12",
    catalogId: "CS_QUANT_007",
    categoryPack: "LLM_PACKS",
    title: "Stream Tokenizer",
    shortDescription:
      "Streaming token quantization with parity checks for post-training model bundles.",
    longDescription:
      "Stream-safe token quantization with parity checks so post-training bundles stay bit-stable across runtimes.",
    tags: ["LLM", "QUANT"],
    author: "@TOK_RAY",
    authorDisplay: "Tok_Ray",
    size: "955 KB",
    avatar: "#be185d",
    version: "v0.9.6",
    lastSync: "22m ago",
    computePerReq: "$0.005/req",
    globalInstalls: "6.8k",
    supportedAgents: ["Claude", "GPT-4o", "Gemini"],
  },
  {
    routeId: "0X2F58",
    displayId: "#0X2F58",
    catalogId: "CS_AUDIO_008",
    categoryPack: "AUDIO_PACKS",
    title: "Audio Lattice",
    shortDescription:
      "Low-latency synthesis graph for modular voice and ambient audio skill chains.",
    longDescription:
      "Composable synthesis graph for voice and ambient chains with deterministic scheduling and low-latency IO.",
    tags: ["AUDIO", "SYNTH"],
    author: "@WAVE_FORM",
    authorDisplay: "Wave_Form",
    size: "3.4 MB",
    avatar: "#0d9488",
    version: "v3.1.0",
    lastSync: "45m ago",
    computePerReq: "$0.012/req",
    globalInstalls: "3.2k",
    supportedAgents: ["Gemini", "GPT-4o", "Claude"],
  },
  {
    routeId: "0X6C33",
    displayId: "#0X6C33",
    catalogId: "CS_GRAPH_009",
    categoryPack: "OPS_PACKS",
    title: "Graph Router",
    shortDescription:
      "Dynamic routing between skill nodes with observability hooks and trace export.",
    longDescription:
      "Routes traffic between skill nodes with rich observability, trace export, and safe fallbacks for degraded paths.",
    tags: ["GRAPH", "OPS"],
    author: "@MESH_OPS",
    authorDisplay: "Mesh_Ops",
    size: "720 KB",
    avatar: "#4f46e5",
    version: "v1.4.2",
    lastSync: "6m ago",
    computePerReq: "$0.002/req",
    globalInstalls: "9.5k",
    supportedAgents: ["Claude", "GPT-4o", "Gemini", "Mistral"],
  },
  {
    routeId: "0X4B01",
    displayId: "#0X4B01",
    catalogId: "CS_EXPORT_010",
    categoryPack: "VISION_PACKS",
    title: "Edge Vision Bundle",
    shortDescription:
      "Pre-trained detection heads packaged for ONNX and TensorRT export paths.",
    longDescription:
      "Detection heads and calibration bundles packaged for ONNX and TensorRT with reproducible export manifests.",
    tags: ["VISION", "EXPORT"],
    author: "@EDGE_LAB",
    authorDisplay: "Edge_Lab",
    size: "1.5 MB",
    avatar: "#ca8a04",
    version: "v2.2.4",
    lastSync: "18m ago",
    computePerReq: "$0.006/req",
    globalInstalls: "7.4k",
    supportedAgents: ["GPT-4o", "Gemini", "Claude"],
  },
  {
    routeId: "0X8D77",
    displayId: "#0X8D77",
    catalogId: "CS_META_011",
    categoryPack: "OPS_PACKS",
    title: "Manifest Validator",
    shortDescription:
      "Strict directory-structure checks aligned with the modular AI skill standard.",
    longDescription:
      "CI-friendly validator for skill directory layouts, manifest hashes, and registry compatibility gates.",
    tags: ["META", "CI"],
    author: "@REGISTRY",
    authorDisplay: "Registry_Bot",
    size: "210 KB",
    avatar: "#64748b",
    version: "v1.0.9",
    lastSync: "1m ago",
    computePerReq: "$0.001/req",
    globalInstalls: "28.3k",
    supportedAgents: ["Claude", "GPT-4o", "Gemini", "Grok"],
  },
  {
    routeId: "0X0E99",
    displayId: "#0X0E99",
    catalogId: "CS_BENCH_012",
    categoryPack: "OPS_PACKS",
    title: "Bench Harness",
    shortDescription:
      "Reproducible benchmarking shell for kernel latency and throughput regression tests.",
    longDescription:
      "Deterministic harness for latency/throughput regression suites with artifact capture and diffable reports.",
    tags: ["TESTS", "BENCH"],
    author: "@VALIDATE_SH",
    authorDisplay: "Validate_SH",
    size: "180 KB",
    avatar: "#b91c1c",
    version: "v0.4.1",
    lastSync: "33m ago",
    computePerReq: "$0.001/req",
    globalInstalls: "11.1k",
    supportedAgents: ["GPT-4o", "Claude"],
  },
];

export function getSkillByRouteId(skillId: string): SkillRecord | undefined {
  const key = decodeURIComponent(skillId).replace(/^#/, "").toUpperCase();
  return SKILLS.find((s) => s.routeId.toUpperCase() === key);
}
