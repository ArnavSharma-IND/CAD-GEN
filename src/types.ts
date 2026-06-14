export type CADSoftware = 'SolidWorks' | 'Fusion 360' | 'AutoCAD' | 'CATIA';

export interface MechanicalMaterial {
  materialCode: string;
  materialGroup: string; // e.g. "Stainless Steel", "Aluminum Alloy", "Plastics", "Copper Alloys"
  density: string; // e.g. "7.93 g/cm^3"
  tensileStrength: string; // e.g. "505 MPa"
  elasticModulus: string; // e.g. "193 GPa"
  machinabilityIndex: string; // e.g. "45%"
  avgCostPerKg: number; // in USD
}

export interface DimensionSpec {
  parameter: string; // e.g. "Outer Diameter"
  value: string; // e.g. "50 mm"
  explanation: string; // e.g. "Sized to meet torque transfer requirements based on standard shaft tolerances"
}

export interface ToleranceSpec {
  feature: string; // e.g. "Shaft Bore H7"
  toleranceValue: string; // e.g. "+0.000 / +0.025 mm"
  standardSystem: string; // e.g. "ISO 286-2 (H7 fits)"
  reasoning: string; // e.g. "Ensures interference fit to prevent rotational slippage on shaft"
}

export interface MaterialSelectionInfo {
  materialCode: string;
  materialGroup: string;
  justification: string;
  properties: {
    density: string;
    tensileStrength: string;
    elasticModulus: string;
    machinabilityIndex: string;
  };
}

export interface ManufacturingProcessInfo {
  method: string; // e.g. "CNC Turning + Broaching"
  details: string[]; // Step-by-step processing setup
  surfacePrep: string; // Pre-treatments, e.g. deburring, cleaning
}

export interface SurfaceFinishSpec {
  roughnessRa: string; // e.g. "Ra 1.6 μm (63 μin)"
  finishType: string; // e.g. "Machined finish with micro-bead blast"
  treatmentDetails: string; // e.g. "Passivation to ASTM A967 for corrosion resistance"
}

export interface AssemblyInstruction {
  stepNumber: number;
  instruction: string;
  toolsNeeded: string;
}

export interface BOMItem {
  itemNo: number;
  partName: string;
  quantity: number;
  material: string;
  source: string; // e.g. "Custom Manufactured", "McMaster-Carr P/N 91251A242"
  estimatedCostUnit: number; // in USD
}

export interface ManufacturingConstraint {
  category: string; // e.g. "Machining limitations", "Draft angles", "Minimum wall thickness"
  constraintValue: string;
  impactOnDesign: string;
}

export interface CostEstimationInfo {
  rawMaterialCost: number; // USD
  machiningLaborCost: number; // USD
  finishingCost: number; // USD
  setupCost: number; // USD
  unitTotalCost: number; // USD
  batchMultiplier: {
    batch10: number; // unit cost for batch of 10
    batch100: number; // unit cost for batch of 100
    batch1000: number; // unit cost for batch of 1000
  };
  costJustification: string;
}

export interface ModelFeatureStep {
  stepNo: number;
  name: string; // e.g. "Base Extrusion"
  operation: string; // e.g. "Extrude Boss"
  parameters: string; // e.g. "Sketch on XY plane: Circle d=50mm, Extrude blind L=120mm"
}

export interface ThreeDModelSpec {
  datumPlane: string;
  originCoord: string;
  features: ModelFeatureStep[];
}

export interface CADScript {
  language: string; // e.g. "Python API", "VBA Macro", "AutoLISP"
  instructions: string; // how to run the script in the parent software
  code: string; // actual automation code script
}

export interface CADSpecification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  sourcePrompt: string;
  cadSoftware: CADSoftware;
  dimensions: DimensionSpec[];
  material: MaterialSelectionInfo;
  manufacturingProcess: ManufacturingProcessInfo;
  tolerances: ToleranceSpec[];
  surfaceFinish: SurfaceFinishSpec[];
  assemblyInstructions: AssemblyInstruction[];
  bom: BOMItem[];
  manufacturingConstraints: ManufacturingConstraint[];
  costEstimation: CostEstimationInfo;
  threeDModelSpec: ThreeDModelSpec;
  cadScript: CADScript;
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  sourcePrompt: string;
  cadSoftware: CADSoftware;
}
