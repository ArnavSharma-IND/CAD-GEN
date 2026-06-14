import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  Settings, 
  FileText, 
  FileCode, 
  BarChart4, 
  HelpCircle, 
  ChevronRight, 
  Copy, 
  Check, 
  Download, 
  Info, 
  RotateCcw, 
  Hammer, 
  TrendingUp, 
  Database,
  ExternalLink,
  Wrench,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { 
  manufacturingMaterials, 
  toleranceGuidelines, 
  finishGuidelines, 
  processGuidelines, 
  presetComponents 
} from './manufacturingDatabase';
import { CADSpecification, CADSoftware } from './types';

// Let's load the default first model from our preset
const INITIAL_DEMO_SPEC: CADSpecification = {
  id: "shaft_coupling_preset",
  title: "Industrial Shaft Coupling (Keyed)",
  description: "High-torque rigid sleeve coupling designed to connect two collinear 25mm transmission shafts using standard DIN 6885 parallel keyways, maintaining absolute concentricity and torsional rigidity under heavy loads.",
  timestamp: new Date().toISOString(),
  sourcePrompt: "Design a stainless steel shaft coupling for connecting two high-torque industrial shafts of 25mm diameter with a keyway slot, rated for rust protection.",
  cadSoftware: "SolidWorks",
  dimensions: [
    { parameter: "Bore Diameter", value: "25.00 mm (H7 fit)", explanation: "H7 clearance match for a standard 25mm steel shaft to ensure a slip/interference fit." },
    { parameter: "Outer Diameter", value: "50.00 mm", explanation: "Ensures adequate hoop strength and walls around the keyway slots." },
    { parameter: "Total Sleeve Length", value: "85.00 mm", explanation: "Sized to provide 40mm of shaft insertion on each side with a 5mm centering hub stop." },
    { parameter: "Keyway Width", value: "8.00 mm", explanation: "Calculated based on DIN 6885 standard engineering dimensions for key slots." },
    { parameter: "Keyway Depth", value: "3.30 mm", explanation: "Recessed hub pocket standard for 8mm high drive keys." },
    { parameter: "Clamping Screw Bore", value: "M6 x 1.0 (qty 2)", explanation: "Dual lock screws situated perpendicular to primary driving flats." }
  ],
  material: {
    materialCode: "SS 316L",
    materialGroup: "Stainless Steels",
    justification: "Critical for corrosive high-moisture pump environments. Austenitic structure maintains toughness at lower heat ratings and limits rotating shaft magnetic interference.",
    properties: {
      density: "8.00 g/cm³",
      tensileStrength: "485 MPa",
      elasticModulus: "193 GPa",
      machinabilityIndex: "36%"
    }
  },
  manufacturingProcess: {
    method: "CNC Turning & Broaching",
    details: [
      "Prepare 55mm raw cylinder bar stock on automated CNC lathe.",
      "Face outer shell diameter to 50.00 mm to ensure balanced balance.",
      "Inward bore pocket to 24.95 mm, then ream with indexable H7 reamer to final 25.00 mm size.",
      "Machine outer chamfers (1.0 mm x 45°) to eliminate sharp mounting corners.",
      "Part off component at exactly 85.00 mm linear length.",
      "Wire-EDM or Broach the internal keyway seat (8.0 mm wide, 3.3 mm deep)."
    ],
    surfacePrep: "Centrifugal barrel tumbling to polish raw machined corners, followed by ASTM A967 passive nitric bath integration."
  },
  tolerances: [
    { feature: "Internal Bore Axis", toleranceValue: "25.000 to +0.021 mm", standardSystem: "ISO 286-2 (H7)", reasoning: "Perfect balance between slip-fit and interference fit under high torque transmission conditions." },
    { feature: "Outer Diameter Shell", toleranceValue: "±0.12 mm", standardSystem: "ISO 2768-medium", reasoning: "Non-mating general envelope. Looser limits prevent unnecessary production costs." },
    { feature: "Sleeve Length", toleranceValue: "+0.15 / -0.00 mm", standardSystem: "Custom fit limits", reasoning: "Ensures full engagement of both shafts with conservative clearance layout." },
    { feature: "Keyway Lateral Width", toleranceValue: "8.000 to +0.036 mm", standardSystem: "ISO JS9 Fit", reasoning: "Holds the key secure against vibration while supporting hand installation patterns." }
  ],
  surfaceFinish: [
    { roughnessRa: "Ra 1.6 μm (63 μin)", finishType: "Turned Surface Finish", treatmentDetails: "Executed with high feed index for aesthetic uniformity on outer casing." },
    { roughnessRa: "Ra 0.8 μm (32 μin)", finishType: "Reamed Inner Bore", treatmentDetails: "Honed and reamed to ensure tight radial contact without micro-vibrations." }
  ],
  assemblyInstructions: [
    { stepNumber: 1, instruction: "Inspect motor side and pump side shafts to verify clean keyway patterns.", toolsNeeded: "Micrometer, cleaning fluid" },
    { stepNumber: 2, instruction: "Fit standard 8x7mm key steel parts halfway into both shafts.", toolsNeeded: "Brass mallet" },
    { stepNumber: 3, instruction: "Lubricate coupling inner bore and slip coupler over the driven shaft center axis.", toolsNeeded: "Penetrating oil film" },
    { stepNumber: 4, instruction: "Insert coupling keys over core alignment and torque down top M6 cone screws.", toolsNeeded: "Hex driver, thread locker adhesive" }
  ],
  bom: [
    { itemNo: 1, partName: "Sleeve Coupling Hub (Keyed)", quantity: 1, material: "Stainless Steel 316L", source: "Custom CNC machined bar stock", estimatedCostUnit: 65.00 },
    { itemNo: 2, partName: "Standard Key Stock 8x7x30mm", quantity: 2, material: "Carbon Steel C45", source: "DIN 6885-A stock supplier", estimatedCostUnit: 1.50 },
    { itemNo: 3, partName: "Set Screws M6x10", quantity: 2, material: "Grade 12.9 Alloy Steel", source: "ISO 4027 commercial part", estimatedCostUnit: 0.40 }
  ],
  manufacturingConstraints: [
    { category: "Aspect Ratio Bounds", constraintValue: "Length-to-bore ratio <= 3.5", impactOnDesign: "Prevents drill drift or internal surface roughness defects during internal deep boring operations." },
    { category: "Wire EDM Slot Radii", constraintValue: "Corner fillet radius R0.1 mm max", impactOnDesign: "Allows standard broaching cuts, avoiding expensive multi-pass CNC slot milling cutters." },
    { category: "Minimum Wall Section", constraintValue: "9.2 mm remaining margin", impactOnDesign: "Safely containing radial shear loads and keyway stress zones under torque spikes." }
  ],
  costEstimation: {
    rawMaterialCost: 14.50,
    machiningLaborCost: 40.00,
    finishingCost: 8.00,
    setupCost: 75.00,
    unitTotalCost: 137.50,
    batchMultiplier: {
      batch10: 82.00,
      batch100: 69.00,
      batch1000: 65.90
    },
    costJustification: "Specialty stainless SS316L requires slower lathe travel speeds than aluminum, elevating labor cycle charges. Standardizing tool sizes helps keep batch costs down."
  },
  threeDModelSpec: {
    datumPlane: "Front Plane (XY)",
    originCoord: "Geometrical geometric center of central bore line",
    features: [
      { stepNo: 1, name: "Revolved Coupling Main Hub", operation: "Revolve boss", parameters: "Sketch outer envelope shape with profile dimensions d=50mm, and center bore of d=25mm on Front plane. Extrude midplane L=85mm symmetric." },
      { stepNo: 2, name: "Parallel Keyway Slot Cut", operation: "Extrude Cut", parameters: "Create rectangle width = 8.0mm centered on vertical quadrant. Extrude cut depth=3.3mm into bore, length=85.0mm (Through All)." },
      { stepNo: 3, name: "Tapped M6 Screw Hub Holing", operation: "M6 Tapped Hole Wizard", parameters: "Position on cylinder top shell face, offset 20.0mm from each outer side casing, drill radial cuts to center line." }
    ]
  },
  cadScript: {
    language: "SolidWorks VBA Macro",
    instructions: "Inside SolidWorks, select Tools > Macro > New. Paste this VBA, pick a target folder, and secure your execution. Runs instantly to build the baseline cylinder coupling.",
    code: `Dim swApp As Object\nDim Part As Object\n\nSub main()\nSet swApp = Application.SldWorks\nSet Part = swApp.ActiveDoc\nIf Part Is Nothing Then\n    Set Part = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\SolidWorks 2024\\templates\\Part.prtdot", 0, 0, 0)\nEnd If\n\n' Main Sleeve Coupling Feature Creation\nPart.Extension.SelectByID2 "Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0\nPart.SketchManager.InsertSketch True\nDim vSkLines As Variant\nvSkLines = Part.SketchManager.CreateCircle(0, 0, 0, 0, 0.025, 0) ' 50mm diameter Outer\nvSkLines = Part.SketchManager.CreateCircle(0, 0, 0, 0, 0.0125, 0) ' 25mm diameter Inner\nPart.FeatureManager.FeatureExtrudedThin2 True, False, False, 0, 0, 0.085, 0.085, False, False, False, False, 0, 0, False, False, False, False, False, 1, 1, 0, 0, False\nPart.SketchManager.InsertSketch False\n\nMsgBox "Baseline Sleeve Coupling Outer Outline Extruded successfully!", vbInformation\nEnd Sub`
  }
};

export default function App() {
  const [promptInput, setPromptInput] = useState("");
  const [selectedSoftware, setSelectedSoftware] = useState<CADSoftware>("SolidWorks");
  const [currentSpec, setCurrentSpec] = useState<CADSpecification>(INITIAL_DEMO_SPEC);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  // Tab Navigation for spec details
  const [activeTab, setActiveTab] = useState<'blueprint' | 'material' | 'process' | 'code' | 'economics'>('blueprint');
  
  // Knowledge Base Accordion & View Selection states
  const [kbTab, setKbTab] = useState<'materials' | 'tolerances' | 'finishes' | 'processes'>('materials');
  const [searchTerm, setSearchTerm] = useState("");
  const [specHistory, setSpecHistory] = useState<CADSpecification[]>([INITIAL_DEMO_SPEC]);
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto scroll to spec header upon load
  const [hasNewGen, setHasNewGen] = useState(false);

  // Clear toast automatically
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadPreset = (presetId: string) => {
    const preset = presetComponents.find(p => p.id === presetId);
    if (preset) {
      setPromptInput(preset.description);
      // Auto-set the material to align nicely
      showToast(`Selected Preset: ${preset.name}`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const promptToSend = promptInput.trim();
    if (!promptToSend) {
      setErrorStatus("Please enter a component description in plain English first.");
      return;
    }

    setErrorStatus(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-cad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptToSend,
          cadSoftware: selectedSoftware
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const data = await response.json() as CADSpecification;
      setCurrentSpec(data);
      
      // Update local generation history without duplication
      setSpecHistory(prev => {
        const filtered = prev.filter(item => item.title !== data.title);
        return [data, ...filtered];
      });
      
      setHasNewGen(true);
      showToast("Specification generated successfully!");
    } catch (err: any) {
      console.error(err);
      setErrorStatus(`Failed to generate CAD specifications. Please check server connections. Details: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePresetDirectly = async (presetId: string) => {
    setErrorStatus(null);
    setIsGenerating(true);
    const pInfo = presetComponents.find(p => p.id === presetId);
    
    try {
      const response = await fetch('/api/generate-cad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: pInfo?.description || "",
          cadSoftware: selectedSoftware,
          presetId: presetId // Direct back-end fallback accelerator
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const data = await response.json() as CADSpecification;
      setCurrentSpec(data);
      
      setSpecHistory(prev => {
        const filtered = prev.filter(item => item.title !== data.title);
        return [data, ...filtered];
      });

      setHasNewGen(true);
      showToast(`Loaded blueprint for ${data.title}`);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(`Failed to fetch preset specifications. Details: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  const downloadJSON = () => {
    const filename = `${currentSpec.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_cad_spec.json`;
    const jsonStr = JSON.stringify(currentSpec, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Downloaded CAD Specifications JSON Package");
  };

  const downloadScriptFile = () => {
    const extension = 
      currentSpec.cadSoftware === "Fusion 360" ? "py" :
      currentSpec.cadSoftware === "AutoCAD" ? "lsp" :
      currentSpec.cadSoftware === "CATIA" ? "catvbs" : "bas";
    
    const filename = `${currentSpec.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_init.${extension}`;
    const blob = new Blob([currentSpec.cadScript.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded CAD script: ${filename}`);
  };

  // Filtering for local engineering DB
  const filteredMaterials = manufacturingMaterials.filter(m => 
    m.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.materialGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTolerances = toleranceGuidelines.filter(t =>
    t.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.machiningMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFinishes = finishGuidelines.filter(f =>
    f.finishType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.roughnessRa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.bestUsedFor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProcesses = processGuidelines.filter(p =>
    p.processName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.guidelines.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F4F4F1] text-[#1A1A1A] font-sans flex flex-col selection:bg-red-200 selection:text-red-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3 shadow-2xl border border-white/20 flex items-center gap-3 animate-fade-in font-mono text-xs">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION - Editorial Aesthetic branding */}
      <header className="border-b border-[#1A1A1A] bg-[#F4F4F1] px-6 py-6 md:px-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none uppercase font-display" id="main-title">
              CAD<span className="text-red-600">|</span>GEN
            </h1>
            <span className="bg-[#1A1A1A] text-white text-[9px] font-mono tracking-widest px-1.5 py-0.5 uppercase">AI-INTEGRATED</span>
          </div>
          <p className="text-[10px] font-mono mt-2 tracking-widest opacity-60 uppercase">
            AI-Assisted Mechanical Specification Builder v1.2.1 // Editorial Blueprint Engine
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-widest">
          <span className="border-b-2 border-red-600 pb-1 cursor-default">Engine Spec</span>
          <a href="#quick-presets" className="opacity-40 hover:opacity-100 transition-opacity pb-1">Presets</a>
          <a href="#rules-database" className="opacity-40 hover:opacity-100 transition-opacity pb-1">Standards Database</a>
        </div>
      </header>

      {/* HERO STATEMENT INTRO */}
      <div className="bg-white border-b border-[#1A1A1A] px-6 py-4 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-[#101010]/80 font-serif italic gap-2">
        <p className="max-w-3xl leading-relaxed">
          "Describe any mechanical workpiece, high-performance structural fitting, tool fixture or fluid control part in plain English. The deep synthesis engine combines raw engineering heuristics, material databases, and geometry rules into step-by-step CAD blueprints and automation code."
        </p>
        <span className="font-mono text-[10px] opacity-60 shrink-0 uppercase tracking-wider hidden md:inline">
          SYS STATUS: READY TO EXTRUDE
        </span>
      </div>

      {/* MAIN LAYOUT GRID */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 border-b border-[#1A1A1A] divide-y lg:divide-y-0 lg:divide-x divide-[#1A1A1A]">
        
        {/* LEFT COLUMN: CONTROL DECK (lg:col-span-5) */}
        <section className="lg:col-span-5 flex flex-col p-6 md:p-8 bg-[#F4F4F1]/60">
          
          <div className="mb-6">
            <span className="text-[10px] font-mono bg-red-100 text-red-800 font-bold px-2 py-0.5 uppercase tracking-widest inline-block mb-3">
              Input Deck
            </span>
            <h2 className="text-2xl font-bold tracking-tight font-display uppercase">Mechanical Objectives</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6 flex-1">
            
            {/* Component Description Textarea */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/80">
                  Natural Language Description <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPromptInput("Design a titanium high-pressure gas nozzle with micro-combustion slots, M12 external mounting screws, and tight surface roughness for aerospace sealing.");
                    showToast("Loaded custom test prompt!");
                  }}
                  className="text-[10px] hover:text-red-600 font-medium tracking-wide transition-colors uppercase underline decoration-dotted"
                >
                  Load prompt example
                </button>
              </div>
              <div className="relative">
                {/* Vintage style absolute corner marks */}
                <div className="absolute -left-1.5 -top-1.5 w-3.5 h-3.5 border-t border-l border-red-500"></div>
                <div className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 border-b border-r border-red-500"></div>
                
                <textarea
                  value={promptInput}
                  onChange={(e) => {
                    setPromptInput(e.target.value);
                    if (errorStatus) setErrorStatus(null);
                  }}
                  className="w-full h-44 bg-white border border-[#1A1A1A] p-4 text-sm font-sans placeholder:font-serif placeholder:italic placeholder:text-[#1A1A1A]/40 focus:outline-none focus:ring-1 focus:ring-red-600 shadow-inner resize-none leading-relaxed"
                  placeholder="e.g., Design a heavy-duty stainless steel shaft coupling with a standard keyway slot connecting two 25mm rotating transmission shafts under high mechanical shear..."
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1.5 leading-snug">
                Describe the shape, size limits, function, material intentions, internal core diameters or bearing fits.
              </p>
            </div>

            {/* Target CAD Platform Selector */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest block mb-2 text-[#1A1A1A]/80">
                Target CAD Integration Software
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['SolidWorks', 'Fusion 360', 'AutoCAD', 'CATIA'] as CADSoftware[]).map((platform) => {
                  const isActive = selectedSoftware === platform;
                  return (
                    <button
                      key={platform}
                      type="button"
                      id={`platform-${platform.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => {
                        setSelectedSoftware(platform);
                        showToast(`Switched CAD module to ${platform}`);
                      }}
                      className={`py-2 px-3 text-xs font-bold font-mono tracking-tighter uppercase border transition-all ${
                        isActive 
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' 
                        : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/30 hover:border-[#1A1A1A] hover:bg-gray-50'
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 p-2 bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[10px] font-mono text-gray-600 flex items-center justify-between">
                <span>Active Language Link:</span>
                <span className="font-semibold text-red-700">
                  {selectedSoftware === 'SolidWorks' && 'VBA Macro (.bas)'}
                  {selectedSoftware === 'Fusion 360' && 'Python API (.py)'}
                  {selectedSoftware === 'AutoCAD' && 'AutoLISP (.lsp)'}
                  {selectedSoftware === 'CATIA' && 'CATScript (.catvbs)'}
                </span>
              </div>
            </div>

            {/* Submit Action Block */}
            <div className="pt-2">
              <button
                type="submit"
                id="synthesize-btn"
                disabled={isGenerating}
                className={`w-full py-5 px-6 flex items-center justify-center gap-3 transition-colors uppercase tracking-widest text-[#F4F4F1] font-bold text-xs ${
                  isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 active:bg-[#1A1A1A]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Synthesizing Components...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Synthesize Specifications</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick presets list targeting mechanical guidelines */}
          <div className="mt-8 pt-8 border-t border-[#1A1A1A]/20" id="quick-presets">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs uppercase font-bold tracking-widest text-[#1A1A1A]">
                Engineering Presets / Benchmarks
              </h3>
              <span className="text-[9px] font-mono opacity-50">QUICK TESTING</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {presetComponents.map((preset) => (
                <div 
                  key={preset.id}
                  className="bg-white border border-[#1A1A1A]/35 hover:border-[#1a1a1a] p-3 transition-all flex flex-col justify-between"
                  id={`preset-card-${preset.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold uppercase">{preset.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[9px] font-mono bg-gray-100 px-1 py-0.5 text-gray-700 font-semibold">{preset.category}</span>
                        <span className="text-[9px] font-mono bg-[#1A1A1A]/5 px-1 py-0.5 text-red-700 font-semibold">{preset.material}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">#preset</span>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-2 leading-tight">
                    {preset.description}
                  </p>
                  
                  <div className="mt-3 pt-2 border-t border-dashed border-gray-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => loadPreset(preset.id)}
                      className="text-[10px] uppercase font-bold text-gray-600 hover:text-[#1A1A1A]"
                    >
                      Fill Draft
                    </button>
                    <button
                      type="button"
                      id={`btn-direct-${preset.id}`}
                      onClick={() => handleGeneratePresetDirectly(preset.id)}
                      className="text-[10px] uppercase font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <span>Instaload Spec & Code</span>
                      <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Generation History logs */}
          <div className="mt-8 pt-8 border-t border-[#1A1A1A]/20">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs uppercase font-bold tracking-widest text-[#1A1A1A]">
                Recent Run History
              </h3>
              <span className="text-[9px] font-mono text-gray-400">{specHistory.length} Saved Items</span>
            </div>
            
            {specHistory.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No previous runs this session.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {specHistory.map((hist) => (
                  <button
                    key={hist.id}
                    onClick={() => {
                      setCurrentSpec(hist);
                      showToast(`Loaded dynamic record: ${hist.title}`);
                    }}
                    className={`w-full text-left p-2.5 border transition-all text-xs flex justify-between items-center ${
                      currentSpec.id === hist.id 
                        ? 'bg-white border-[#1A1A1A] font-medium' 
                        : 'bg-[#F4F4F1] border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold uppercase truncate">{hist.title}</p>
                      <p className="text-[9px] text-gray-500 truncate">{hist.sourcePrompt}</p>
                    </div>
                    <span className="text-[9px] font-mono bg-gray-100 px-1 text-gray-600 rounded">
                      {hist.cadSoftware}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* RIGHT COLUMN: BLUEPRINT VISUALIZER (lg:col-span-7) */}
        <section className="lg:col-span-7 bg-white p-6 md:p-8 flex flex-col relative">
          
          {/* Diagnostic Corner Plate */}
          <div className="absolute top-0 right-0 py-2.5 px-4 border-l border-b border-[#1A1A1A] bg-[#F4F4F1]/30 hidden sm:block">
            <span className="text-[9px] font-mono text-gray-600">
              SPEC_UID: {currentSpec.id}
            </span>
          </div>

          {/* Current Spec Core Information */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[9px] font-mono font-bold tracking-widest bg-red-600 text-white px-2 py-0.5 rounded-sm">
                SPEC-SHEET
              </span>
              <span className="text-[9px] font-mono bg-[#1A1A1A] text-white px-2 py-0.5 rounded-sm">
                SYSTEM: {currentSpec.cadSoftware.toUpperCase()}
              </span>
              <span className="text-[10px] text-gray-400 font-mono ml-auto">
                Synthesized: {new Date(currentSpec.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] font-display uppercase border-b border-[#1A1A1A]/10 pb-2">
              {currentSpec.title}
            </h2>
            
            <p className="text-sm font-serif italic text-gray-700 mt-3 leading-relaxed border-l-2 border-red-500 pl-4 py-1 bg-gray-50/50">
              "{currentSpec.description}"
            </p>
          </div>

          {/* Live System Tabs selector with Custom icons */}
          <div className="border-b border-[#1A1A1A] flex flex-wrap gap-1 mb-6">
            <button
              onClick={() => setActiveTab('blueprint')}
              id="tab-blueprint"
              className={`px-4 py-2 text-xs font-bold uppercase transition-all tracking-wider flex items-center gap-1.5 border-t border-x -mb-px ${
                activeTab === 'blueprint' 
                ? 'bg-white border-[#1A1A1A] border-b-white text-[#1A1A1A]' 
                : 'bg-gray-50 border-transparent text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              <Layers size={13} />
              <span>Blueprint Spec</span>
            </button>
            <button
              onClick={() => setActiveTab('material')}
              id="tab-material"
              className={`px-4 py-2 text-xs font-bold uppercase transition-all tracking-wider flex items-center gap-1.5 border-t border-x -mb-px ${
                activeTab === 'material' 
                ? 'bg-white border-[#1A1A1A] border-b-white text-[#1A1A1A]' 
                : 'bg-gray-50 border-transparent text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              <Cpu size={13} strokeWidth={2.5} />
              <span>Material Science</span>
            </button>
            <button
              onClick={() => setActiveTab('process')}
              id="tab-process"
              className={`px-4 py-2 text-xs font-bold uppercase transition-all tracking-wider flex items-center gap-1.5 border-t border-x -mb-px ${
                activeTab === 'process' 
                ? 'bg-white border-[#1A1A1A] border-b-white text-[#1A1A1A]' 
                : 'bg-gray-50 border-transparent text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              <Hammer size={13} />
              <span>Manufacturing</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              id="tab-code"
              className={`px-4 py-2 text-xs font-bold uppercase transition-all tracking-wider flex items-center gap-1.5 border-t border-x -mb-px ${
                activeTab === 'code' 
                ? 'bg-white border-[#1A1A1A] border-b-white text-red-600' 
                : 'bg-gray-50 border-transparent text-gray-500 hover:text-red-600'
              }`}
            >
              <FileCode size={13} />
              <span>CAD Automation Code</span>
            </button>
            <button
              onClick={() => setActiveTab('economics')}
              id="tab-economics"
              className={`px-4 py-2 text-xs font-bold uppercase transition-all tracking-wider flex items-center gap-1.5 border-t border-x -mb-px ${
                activeTab === 'economics' 
                ? 'bg-white border-[#1A1A1A] border-b-white text-[#1A1A1A]' 
                : 'bg-gray-50 border-transparent text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              <BarChart4 size={13} />
              <span>Economics</span>
            </button>
          </div>

          {/* TAB VIEWPORTS */}
          <div className="flex-1 min-h-[420px]">
            
            {/* VIEW 1: BLUEPRINT SPEC */}
            {activeTab === 'blueprint' && (
              <div className="space-y-6 animate-fade-in" id="content-blueprint">
                
                {/* Dual Layout: Dimensions & Tolerances */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Dimensions Box */}
                  <div className="border border-[#1A1A1A] p-4 relative bg-[#F4F4F1]/30">
                    <div className="absolute top-0 right-0 p-1.5 bg-[#1A1A1A] text-white text-[8px] font-mono uppercase tracking-wider">
                      DIM_LIST_01
                    </div>
                    <h3 className="text-xs uppercase font-bold tracking-[0.2em] border-b border-[#1A1A1A] pb-1.5 mb-3 flex items-center gap-1 text-[#1A1A1A]">
                      <span className="w-1.5 h-1.5 bg-red-600"></span>
                      Geometric Dimensions
                    </h3>
                    <table className="w-full text-[11px] font-mono leading-relaxed divide-y divide-gray-100">
                      <tbody>
                        {currentSpec.dimensions.map((dim, i) => (
                          <tr key={i} className="group hover:bg-white/60">
                            <td className="py-2 text-gray-500 font-bold uppercase align-top pr-2 w-1/3">{dim.parameter}</td>
                            <td className="py-2 text-[#1A1A1A] font-bold align-top whitespace-nowrap">{dim.value}</td>
                            <td className="py-2 text-[10px] text-gray-600 align-top pl-2 leading-tight italic font-sans">{dim.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tolerances Box */}
                  <div className="border border-[#1A1A1A] p-4 relative bg-[#F4F4F1]/30">
                    <div className="absolute top-0 right-0 p-1.5 bg-[#1A1A1A] text-white text-[8px] font-mono uppercase tracking-wider">
                      TOL_ISO_DEVIATION
                    </div>
                    <h3 className="text-xs uppercase font-bold tracking-[0.2em] border-b border-[#1A1A1A] pb-1.5 mb-3 flex items-center gap-1 text-[#1A1A1A]">
                      <span className="w-1.5 h-1.5 bg-red-600"></span>
                      Engineering Fit Limits
                    </h3>
                    <table className="w-full text-[11px] font-mono leading-relaxed divide-y divide-gray-100">
                      <tbody>
                        {currentSpec.tolerances.map((tol, i) => (
                          <tr key={i} className="group hover:bg-white/60">
                            <td className="py-2 text-gray-500 font-bold uppercase align-top pr-2 w-1/4">{tol.feature}</td>
                            <td className="py-2 text-red-700 font-bold align-top whitespace-nowrap">{tol.toleranceValue}</td>
                            <td className="py-2 text-[10px] text-gray-600 align-top pl-2 leading-tight font-sans">
                              <span className="font-mono text-[9px] bg-gray-200 px-1 py-0.5 rounded text-gray-700 font-bold mr-1 block sm:inline-block">
                                {tol.standardSystem}
                              </span>
                              {tol.reasoning}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* 3D Model Construction Steps */}
                <div className="border border-[#1A1A1A] p-5 relative">
                  <div className="absolute top-0 right-0 p-1.5 bg-red-600 text-white text-[8px] font-mono uppercase tracking-widest">
                    3D_DRAFTING_STEPS
                  </div>
                  <h3 className="text-xs uppercase font-bold tracking-[0.2em] border-b border-[#1A1A1A] pb-1.5 mb-4 flex items-center gap-1">
                    <Database size={13} className="text-red-600" />
                    Interactive feature construction order
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono mb-4 text-gray-600">
                    <div>
                      <span className="font-bold text-[#1A1A1A] uppercase">Recommended Datum Plane:</span> {currentSpec.threeDModelSpec.datumPlane}
                    </div>
                    <div>
                      <span className="font-bold text-[#1A1A1A] uppercase">Part Origin Anchor:</span> {currentSpec.threeDModelSpec.originCoord}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentSpec.threeDModelSpec.features.map((feat) => (
                      <div key={feat.stepNo} className="bg-[#F4F4F1]/40 border border-[#1A1A1A]/10 p-3 rounded-sm flex gap-3 text-xs leading-relaxed">
                        <span className="font-mono text-sm font-bold text-red-600 w-8 shrink-0 border-r border-[#1A1A1A]/10">
                          {feat.stepNo.toString().padStart(2, '0')}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold text-[#1A1A1A] uppercase">{feat.name}</span>
                            <span className="text-[9px] font-mono bg-white border border-gray-300 text-gray-600 px-1.5 py-0.5 rounded uppercase">
                              {feat.operation}
                            </span>
                          </div>
                          <p className="text-gray-700 font-mono text-[11px] whitespace-pre-wrap">{feat.parameters}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assembly Steps */}
                <div className="border border-[#1A1A1A]/30 p-4 rounded bg-[#1A1A1A]/5">
                  <h3 className="text-xs uppercase font-bold tracking-[0.2em] mb-3 flex items-center gap-1.5 text-gray-800">
                    <Wrench size={12} />
                    Field Assembly & Mounting sequence
                  </h3>
                  <div className="space-y-2">
                    {currentSpec.assemblyInstructions.map((step) => (
                      <div key={step.stepNumber} className="text-xs leading-relaxed flex items-start gap-2.5">
                        <span className="font-mono text-[10px] bg-[#1A1A1A] text-[#F4F4F1] w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0">
                          {step.stepNumber}
                        </span>
                        <div className="flex-1 text-[#1a1a1a]">
                          <p>{step.instruction}</p>
                          <span className="text-[10px] text-red-700 font-mono">Tools required: {step.toolsNeeded}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 2: MATERIAL PROPERTIES */}
            {activeTab === 'material' && (
              <div className="space-y-6 animate-fade-in" id="content-material">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Selected Material Card */}
                  <div className="border border-[#1A1A1A] p-6 bg-white relative flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-1.5 bg-[#1A1A1A] text-white text-[8px] font-mono uppercase tracking-wider">
                      SELECTED_STOCK
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase">{currentSpec.material.materialGroup}</span>
                      <h3 className="text-3xl font-bold font-display uppercase tracking-tight text-[#1A1A1A] mt-1 mb-3">
                        {currentSpec.material.materialCode}
                      </h3>
                      <div className="h-0.5 bg-red-600 w-16 mb-4"></div>
                      <p className="text-xs text-gray-700 leading-relaxed font-serif italic">
                        "{currentSpec.material.justification}"
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-[#1A1A1A]/10 bg-[#F4F4F1]/30 p-3">
                      <span className="text-[9px] font-mono block text-gray-600 mb-2 uppercase tracking-widest">
                        Database Material Constants
                      </span>
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase">Density</p>
                          <p className="font-bold text-[#1a1a1a]">{currentSpec.material.properties.density}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase">Tensile Strength</p>
                          <p className="font-bold text-[#1a1a1a]">{currentSpec.material.properties.tensileStrength}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase">Elastic Modulus</p>
                          <p className="font-bold text-[#1a1a1a]">{currentSpec.material.properties.elasticModulus}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase">Machinability index</p>
                          <p className="font-bold text-[11px] text-red-600 font-semibold">
                            {currentSpec.material.properties.machinabilityIndex}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Surface Finish Specifications */}
                  <div className="border border-[#1A1A1A] p-5 relative bg-[#F4F4F1]/30 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-1.5 bg-[#1A1A1A] text-white text-[8px] font-mono uppercase tracking-wider">
                      SURFACE_SPEC
                    </div>
                    <div>
                      <h3 className="text-xs uppercase font-bold tracking-[0.2em] border-b border-[#1A1A1A] pb-1.5 mb-4 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-600"></span>
                        Surface Finish & Corrosion treatments
                      </h3>
                      
                      <div className="space-y-4">
                        {currentSpec.surfaceFinish.map((fin, i) => (
                          <div key={i} className="border border-[#1A1A1A]/10 p-3 bg-white rounded-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs uppercase text-[#1a1a1a]">{fin.finishType}</span>
                              <span className="font-mono text-xs font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                {fin.roughnessRa}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600 leading-snug">{fin.treatmentDetails}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-3 border border-red-500/10 bg-red-50/50 text-[11px] text-gray-700 leading-normal">
                      <span className="font-bold text-red-800 uppercase text-[9px] font-mono tracking-widest block mb-1">
                        * SURFACE QUALITY CAUTION
                      </span>
                      Reducing roughness values below Ra 0.4 μm exponentially spikes grinding labor expense. Keep static components at standard machined limits.
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW 3: MANUFACTURING PROCESS */}
            {activeTab === 'process' && (
              <div className="space-y-6 animate-fade-in" id="content-process">
                
                <div className="border border-[#1A1A1A] p-6 relative">
                  <div className="absolute top-0 right-0 p-1.5 bg-[#1A1A1A] text-white text-[8px] font-mono uppercase tracking-wider">
                    FABRICATION_TRAVELER
                  </div>

                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1">
                    Primary Route Method
                  </span>
                  <h3 className="text-3xl font-bold tracking-tight text-[#1A1A1A] font-display uppercase mb-4">
                    {currentSpec.manufacturingProcess.method}
                  </h3>

                  <div className="h-px bg-gray-200 mb-4"></div>

                  <h4 className="text-[11px] font-mono uppercase font-bold text-red-700 mb-3 tracking-widest">
                    Step-by-step Fabrication Traveler Routing rules
                  </h4>

                  <ol className="relative border-l border-red-600 ml-3 space-y-4 pt-1 pb-1">
                    {currentSpec.manufacturingProcess.details.map((detail, idx) => (
                      <li key={idx} className="mb-2 ml-4">
                        <div className="absolute w-2.5 h-2.5 bg-red-600 rounded-full -left-1.25 mt-1 border border-white"></div>
                        <time className="mb-1 text-[10px] font-mono text-gray-400 font-bold uppercase block">
                          OPERATION { (idx + 1).toString().padStart(2, '0') }
                        </time>
                        <p className="text-xs text-gray-700 leading-relaxed font-mono">
                          {detail}
                        </p>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-6 pt-5 border-t border-[#1A1A1A]/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#F4F4F1]/40 border border-[#1A1A1A]/10 p-3">
                      <span className="text-[9px] font-mono uppercase font-semibold text-gray-600 block mb-1">
                        Post-Process Surface Prep
                      </span>
                      <p className="text-xs text-[#1A1A1A] leading-relaxed">
                        {currentSpec.manufacturingProcess.surfacePrep}
                      </p>
                    </div>
                    
                    <div className="bg-[#F4F4F1]/40 border border-[#1A1A1A]/10 p-3">
                      <span className="text-[9px] font-mono uppercase font-semibold text-gray-600 block mb-1">
                        Traceability Standard
                      </span>
                      <p className="text-xs text-[#1A1A1A] leading-relaxed">
                        Component logs tracked under ISO-9001 quality audits. Parts must be visually engraved or stamped with the primary gen code.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manufacturing Constraints list */}
                <div className="border border-[#1A1A1A] p-5 relative">
                  <div className="absolute top-0 right-0 p-1.5 bg-red-600 text-white text-[8px] font-mono uppercase tracking-widest">
                    CONSTRAINT_LIST
                  </div>
                  <h3 className="text-xs uppercase font-bold tracking-[0.2em] border-b border-[#1A1A1A] pb-1.5 mb-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-red-600"></span>
                    Design For Manufacturability (DFM) Limits
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentSpec.manufacturingConstraints.map((con, idx) => (
                      <div key={idx} className="bg-[#F4F4F1]/20 border border-gray-200 p-3.5 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-gray-500 uppercase block tracking-wider leading-none mb-1">
                            {con.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-red-600 inline-block mb-2">
                            {con.constraintValue}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-snug">
                          {con.impactOnDesign}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 4: AUTOMATION CODE SCRIPTS */}
            {activeTab === 'code' && (
              <div className="space-y-4 animate-fade-in" id="content-code">
                
                <div className="border border-[#1A1A1A] p-4 relative bg-[#1A1A1A] text-gray-200 rounded-sm">
                  
                  {/* Script Header Info toolbar */}
                  <div className="flex flex-wrap justify-between items-center pb-2.5 mb-3 border-b border-gray-800 text-[10px] font-mono tracking-wider gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
                      <span className="text-white font-bold">{currentSpec.cadScript.language.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard(currentSpec.cadScript.code, "automation script")}
                        className="hover:text-white bg-gray-800 text-gray-300 px-2 py-1 rounded transition-colors flex items-center gap-1 uppercase"
                      >
                        {copiedStatus ? <Check size={10} /> : <Copy size={10} />}
                        <span>{copiedStatus ? "Copied" : "Copy Code"}</span>
                      </button>
                      
                      <button 
                        onClick={downloadScriptFile}
                        className="hover:text-white bg-red-700 text-white px-2 py-1 rounded transition-colors flex items-center gap-1 uppercase"
                      >
                        <Download size={10} />
                        <span>Download Script</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] font-sans text-gray-400 leading-relaxed mb-4 p-2.5 bg-gray-900/60 rounded">
                    <strong>Instructions:</strong> {currentSpec.cadScript.instructions}
                  </p>

                  <div className="relative font-mono text-[11px] leading-relaxed overflow-x-auto p-4 bg-black/80 rounded max-h-[380px] border border-gray-800">
                    <pre className="whitespace-pre">
                      <code className="text-green-400 select-all">
                        {currentSpec.cadScript.code}
                      </code>
                    </pre>
                  </div>

                  <div className="text-[9px] text-gray-500 mt-2 text-right">
                    Macro contains setup variables mapped exactly to verified {currentSpec.cadSoftware} SDK libraries.
                  </div>
                </div>

                <div className="p-4 border border-[#1A1A1A] text-xs bg-white/75 leading-relaxed">
                  <span className="font-bold text-red-700 block mb-1 uppercase tracking-wider text-[10px]">
                    How to execute in CAD App:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li><strong>SolidWorks:</strong> Open SW &rarr; Tools Menu &rarr; Macro &rarr; New... &rarr; Paste macro block as main &rarr; Press F5 to execute.</li>
                    <li><strong>Fusion 360:</strong> Open Fusion &rarr; UTILITIES Tab &rarr; ADD-INS &rarr; Create Python Script &rarr; paste raw code block.</li>
                    <li><strong>AutoCAD:</strong> Open Terminal CommandLine &rarr; Enter <code>VLISP</code> or use <code>APPLOAD</code> command to import file directly.</li>
                  </ul>
                </div>

              </div>
            )}

            {/* VIEW 5: ECONOMICS */}
            {activeTab === 'economics' && (
              <div className="space-y-6 animate-fade-in" id="content-economics">
                
                {/* Cost Estimation Block */}
                <div className="border border-[#1A1A1A] p-5 relative bg-white">
                  <div className="absolute top-0 right-0 p-1.5 bg-[#1A1A1A] text-white text-[8px] font-mono uppercase tracking-wider">
                    ECONOMIC_COST_AUDIT
                  </div>
                  
                  <h3 className="text-xs uppercase font-bold tracking-[0.2em] border-b border-[#1A1A1A] pb-1.5 mb-4">
                    ESTIMATED PRODUCTION COST MATRIX
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#F4F4F1]/30 p-2 border border-gray-200">
                      <p className="text-[10px] text-gray-400 uppercase font-mono">Raw Materials</p>
                      <p className="text-lg font-bold">${currentSpec.costEstimation.rawMaterialCost.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#F4F4F1]/30 p-2 border border-gray-200">
                      <p className="text-[10px] text-gray-400 uppercase font-mono">Machining Labor</p>
                      <p className="text-lg font-bold">${currentSpec.costEstimation.machiningLaborCost.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#F4F4F1]/30 p-2 border border-gray-200">
                      <p className="text-[10px] text-gray-400 uppercase font-mono">Surface Finish</p>
                      <p className="text-lg font-bold">${currentSpec.costEstimation.finishingCost.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-50 p-2 border border-red-200">
                      <p className="text-[10px] text-red-800 uppercase font-mono font-bold">One-Time Setup Fee</p>
                      <p className="text-lg font-bold text-red-700">${currentSpec.costEstimation.setupCost.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Bulk Batch Scale estimation logic */}
                  <div className="border border-[#1A1A1A] p-4 bg-[#F4F4F1]/30 rounded-sm mb-4">
                    <h4 className="text-xs font-mono font-bold uppercase mb-3 text-gray-700 flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-red-700" />
                      Bulk Multi-tier Batch Scale Multipliers (amortized setup cost)
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white p-3 border border-[#1A1A1A]/10">
                        <span className="font-mono text-[9px] text-gray-400 block uppercase">Batch of 10</span>
                        <span className="text-xl font-bold font-mono text-[#1a1a1a]">${currentSpec.costEstimation.batchMultiplier.batch10.toFixed(2)}</span>
                        <span className="text-[10px] block font-mono text-gray-500 mt-0.5">per unit</span>
                      </div>
                      <div className="bg-white p-3 border border-[#1A1A1A]/10">
                        <span className="font-mono text-[9px] text-gray-400 block uppercase">Batch of 100</span>
                        <span className="text-xl font-bold font-mono text-red-700">${currentSpec.costEstimation.batchMultiplier.batch100.toFixed(2)}</span>
                        <span className="text-[10px] block font-mono text-gray-500 mt-0.5">per unit</span>
                      </div>
                      <div className="bg-white p-3 border border-[#1A1A1A]/10">
                        <span className="font-mono text-[9px] text-gray-400 block uppercase">Batch of 1,000</span>
                        <span className="text-xl font-bold font-mono text-[#1a1a1a]">${currentSpec.costEstimation.batchMultiplier.batch1000.toFixed(2)}</span>
                        <span className="text-[10px] block font-mono text-gray-500 mt-0.5">per unit</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 font-serif leading-relaxed italic border-l-2 border-red-500 pl-3">
                    "{currentSpec.costEstimation.costJustification}"
                  </p>
                </div>

                {/* Structured BOM Table */}
                <div className="border border-[#1A1A1A]/30 rounded p-4">
                  <h3 className="text-xs uppercase font-bold tracking-[0.2em] mb-3 flex items-center gap-1.5 text-gray-800">
                    <ClipboardList size={13} className="text-red-600" />
                    Bill Of Materials (BOM) Generation
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-[#1A1A1A] bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <th className="py-2 px-2 w-12 text-center">Item</th>
                          <th className="py-2 px-2">Part Name / Component</th>
                          <th className="py-2 px-2 text-center w-12">Qty</th>
                          <th className="py-2 px-2">Selected Material</th>
                          <th className="py-2 px-2">Supplier Source</th>
                          <th className="py-2 px-2 text-right">Est. Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentSpec.bom.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-2 px-2 text-center text-gray-400 font-bold">{item.itemNo}</td>
                            <td className="py-2 px-2 text-[#1a1a1a] font-bold">{item.partName}</td>
                            <td className="py-2 px-2 text-center">{item.quantity}</td>
                            <td className="py-2 px-2 text-[#1a1a1a]/80 font-mono text-[11px]">{item.material}</td>
                            <td className="py-2 px-2 text-gray-500 text-[10px]">{item.source}</td>
                            <td className="py-2 px-2 text-right text-red-700 font-bold">${item.estimatedCostUnit.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* DOWNLOADING BAR PACKAGING */}
          <div className="mt-8 pt-6 border-t border-[#1A1A1A]/20 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div>
              <p className="text-[11px] text-gray-600 leading-snug">
                Export files conform exactly to machine coordinate parameters.
              </p>
              <div className="flex gap-4 text-[9px] font-mono text-gray-400 uppercase mt-1">
                <span>EXPORT SCHEMAS: XML / JSON</span>
                <span>•</span>
                <span>Active Link: Local Host API Port 3000</span>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  const summary = `CAD SPECIFICATION SYSTEM OUTLINE:\nName: ${currentSpec.title}\nSoftware Target: ${currentSpec.cadSoftware}\nMaterial: ${currentSpec.material.materialCode}\nDimensions: ${currentSpec.dimensions.map(d => `${d.parameter}: ${d.value}`).join(', ')}`;
                  copyToClipboard(summary, "Plain-text specification synopsis");
                }}
                className="bg-white hover:bg-gray-50 border border-[#1A1A1A] text-[#1A1A1A] py-2.5 px-4 font-mono font-bold uppercase text-[10px] flex items-center justify-center gap-2 transition-colors active:translate-y-px"
              >
                <Copy size={12} />
                <span>Copy Summary</span>
              </button>
              
              <button
                id="export-package-btn"
                onClick={downloadJSON}
                className="bg-[#1A1A1A] text-white hover:bg-black py-2.5 px-4 font-mono font-bold uppercase text-[10px] flex items-center justify-center gap-2 transition-colors active:translate-y-px"
                title="Download full specifications in structural JSON outline"
              >
                <Download size={12} className="text-red-500" />
                <span>Export JSON Package</span>
              </button>
            </div>
          </div>

        </section>

      </main>

      {/* COMPACT INTERACTIVE MANUFACTURING KNOWLEDGE BASE */}
      <section className="bg-white border-b border-[#1A1A1A] p-6 md:p-12" id="rules-database">
        
        {/* DB Section Header */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 border-b border-[#1A1A1A] pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Database className="text-red-600" size={16} />
                <span className="text-[10px] font-mono tracking-widest font-bold text-gray-500 uppercase">
                  MANUFACTURING STANDARDS DATABASE
                </span>
              </div>
              <h2 className="text-3xl font-bold uppercase font-display tracking-tight text-[#1a1a1a]">
                Standard Rules & Materials Calibration
              </h2>
            </div>

            {/* Quick search Filter inside Knowledge Base */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder="Search raw properties, materials or processes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs font-mono bg-[#F4F4F1] border border-[#1A1A1A]/30 rounded-sm py-2 pl-3 pr-8 focus:outline-none focus:border-[#1A1A1A]"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2 text-xs font-mono hover:text-red-600"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* DB Nav switches */}
            <div className="lg:col-span-3 flex flex-col gap-1">
              <span className="text-[9px] font-mono uppercase text-gray-400 tracking-wider mb-2">Category Tables</span>
              <button
                onClick={() => setKbTab('materials')}
                className={`w-full text-left p-3 text-xs font-mono uppercase tracking-wider border-l-2 transition-all flex justify-between items-center ${
                  kbTab === 'materials' 
                    ? 'border-red-600 bg-[#F4F4F1] text-[#1A1A1A] font-bold' 
                    : 'border-transparent text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-100'
                }`}
              >
                <span>Stock Alloys & Polymers</span>
                <span className="text-[9px] bg-white border border-gray-200 px-1 text-gray-400">{manufacturingMaterials.length}</span>
              </button>
              <button
                onClick={() => setKbTab('processes')}
                className={`w-full text-left p-3 text-xs font-mono uppercase tracking-wider border-l-2 transition-all flex justify-between items-center ${
                  kbTab === 'processes' 
                    ? 'border-red-600 bg-[#F4F4F1] text-[#1A1A1A] font-bold' 
                    : 'border-transparent text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-100'
                }`}
              >
                <span>Fabrication Processes</span>
                <span className="text-[9px] bg-white border border-gray-200 px-1 text-gray-400">{processGuidelines.length}</span>
              </button>
              <button
                onClick={() => setKbTab('tolerances')}
                className={`w-full text-left p-3 text-xs font-mono uppercase tracking-wider border-l-2 transition-all flex justify-between items-center ${
                  kbTab === 'tolerances' 
                    ? 'border-red-600 bg-[#F4F4F1] text-[#1A1A1A] font-bold' 
                    : 'border-transparent text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-100'
                }`}
              >
                <span>Linear Tolerances (ISO 2768)</span>
                <span className="text-[9px] bg-white border border-gray-200 px-1 text-gray-400">{toleranceGuidelines.length}</span>
              </button>
              <button
                onClick={() => setKbTab('finishes')}
                className={`w-full text-left p-3 text-xs font-mono uppercase tracking-wider border-l-2 transition-all flex justify-between items-center ${
                  kbTab === 'finishes' 
                    ? 'border-red-600 bg-[#F4F4F1] text-[#1A1A1A] font-bold' 
                    : 'border-transparent text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-100'
                }`}
              >
                <span>Roughness Standards (Ra/μm)</span>
                <span className="text-[9px] bg-white border border-gray-200 px-1 text-gray-400">{finishGuidelines.length}</span>
              </button>

              <div className="p-3 bg-red-50 border border-red-500/10 text-[10px] text-gray-600 mt-4 font-mono leading-relaxed">
                <span className="font-bold text-red-800 uppercase block mb-1">PRO-TIP:</span>
                Selecting standard materials from this database saves raw sourcing lead time and improves cost estimation reliability.
              </div>
            </div>

            {/* DB View Pane */}
            <div className="lg:col-span-9 bg-[#F4F4F1]/40 border border-[#1A1A1A] p-6 max-h-[360px] overflow-y-auto">
              {kbTab === 'materials' && (
                <div className="space-y-4">
                  <div className="flex justify-between font-mono text-[10px] text-gray-400 uppercase border-b border-gray-200 pb-1 font-bold">
                    <span>Stock Material</span>
                    <span>Machinability / Avg Cost per kg</span>
                  </div>
                  {filteredMaterials.map((mat) => (
                    <div 
                      key={mat.materialCode} 
                      className="bg-white p-4 border border-gray-200 hover:border-gray-400 transition-all cursor-pointer flex justify-between items-start"
                      onClick={() => {
                        setPromptInput(prev => `${prev} Material specification prioritized: ${mat.materialCode} (${mat.materialGroup}).`);
                        showToast(`Appended ${mat.materialCode} preference query`);
                      }}
                    >
                      <div>
                        <span className="text-[9px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold uppercase">{mat.materialGroup}</span>
                        <h4 className="text-sm font-bold text-[#1a1a1a] mt-1">{mat.materialCode}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-gray-600 font-mono mt-2">
                          <div>Density: {mat.density}</div>
                          <div>Tensile Limit: {mat.tensileStrength}</div>
                          <div>Modulus: {mat.elasticModulus}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold shrink-0">
                        <p className="text-red-700 text-sm">Machinability: {mat.machinabilityIndex}</p>
                        <p className="text-xs text-gray-500 mt-0.5">~${mat.avgCostPerKg.toFixed(2)}/kg</p>
                        <span className="text-[8px] bg-red-100 text-red-800 px-1 uppercase tracking-tighter">Click to apply selection</span>
                      </div>
                    </div>
                  ))}
                  {filteredMaterials.length === 0 && (
                    <p className="text-xs text-gray-400 italic font-mono">No matching stock material found matching query.</p>
                  )}
                </div>
              )}

              {kbTab === 'processes' && (
                <div className="space-y-4">
                  {filteredProcesses.map((p) => (
                    <div 
                      key={p.processName} 
                      className="bg-white p-4 border border-gray-200 hover:border-gray-400 transition-all cursor-pointer"
                      onClick={() => {
                        setPromptInput(prev => `${prev} Manufacturing process prioritized: ${p.processName}.`);
                        showToast(`Appended process preference: ${p.processName}`);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-[#1a1a1a] uppercase">{p.processName}</h4>
                          <p className="text-[11px] font-mono text-gray-500 mt-0.5">Typical Limit: {p.typicalTolerance} | Min Wall Thickness: {p.minWallThickness}</p>
                        </div>
                        <div className="text-right text-[10px] font-mono uppercase">
                          <span className="inline-block bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded mr-1">Setup: {p.setupCostLevel}</span>
                          <span className="inline-block bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Cost: {p.unitCostLevel}</span>
                        </div>
                      </div>
                      <div className="mt-2 pl-3 border-l text-xs text-gray-600 leading-normal space-y-1">
                        <p className="font-bold text-[9px] font-mono text-red-700 uppercase">DFM Rules:</p>
                        {p.guidelines.map((g, idx) => (
                          <div key={idx} className="flex gap-1">
                            <span className="text-[#1a1a1a]">•</span>
                            <span>{g}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {kbTab === 'tolerances' && (
                <div className="space-y-4">
                  {filteredTolerances.map((tol) => (
                    <div key={tol.class} className="bg-white p-4 border border-gray-200 leading-relaxed text-xs">
                      <div className="flex justify-between items-baseline border-b border-gray-100 pb-1 mb-2">
                        <h4 className="font-mono font-bold text-red-700 uppercase">{tol.class}</h4>
                        <span className="font-mono text-gray-500 text-[10px]">Methods: {tol.machiningMethod}</span>
                      </div>
                      <p className="italic text-gray-700 mb-2">"{tol.description}"</p>
                      <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-gray-50 p-2 text-center text-gray-600">
                        <div>L=1-10mm: <strong className="text-gray-900">{tol.linearTolerance_1to10mm}</strong></div>
                        <div>L=10-50mm: <strong className="text-gray-900">{tol.linearTolerance_10to50mm}</strong></div>
                        <div>L=50-120mm: <strong className="text-gray-900">{tol.linearTolerance_50to120mm}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {kbTab === 'finishes' && (
                <div className="space-y-4">
                  {filteredFinishes.map((f) => (
                    <div key={f.finishType} className="bg-white p-4 border border-gray-200 flex justify-between items-start text-xs">
                      <div>
                        <h4 className="font-bold text-[#1a1a1a] uppercase">{f.finishType}</h4>
                        <p className="text-[11px] font-mono text-gray-500 mt-1">Standard Scale: {f.industryStandard} | Best for: {f.bestUsedFor}</p>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <span className="text-sm font-bold text-red-700 bg-red-50 py-0.5 px-2 inline-block rounded">{f.roughnessRa}</span>
                        <span className="block text-[9px] text-gray-400 mt-1">Cost index: ~{f.relativeCostIndex}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </section>

      {/* FOOTER SECTION: SYSTEM READINESS */}
      <footer className="bg-[#1A1A1A] text-white px-6 py-4 md:px-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono uppercase tracking-[0.2em] gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
          <span>Engine Sync: {selectedSoftware.toUpperCase()} 2026 ACTIVE</span>
        </div>
        <div>
          <span>Design for CNC: MILLING // LATHE TURNING // SHEET METAL</span>
        </div>
        <div className="text-red-500 font-bold">
          System Core Standby_
        </div>
      </footer>

    </div>
  );
}
