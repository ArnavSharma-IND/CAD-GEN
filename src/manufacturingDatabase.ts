import { MechanicalMaterial } from './types';

export interface ToleranceRule {
  class: string;
  description: string;
  linearTolerance_1to10mm: string;
  linearTolerance_10to50mm: string;
  linearTolerance_50to120mm: string;
  machiningMethod: string;
}

export interface FinishRule {
  finishType: string;
  roughnessRa: string;
  relativeCostIndex: number; // multiplier
  industryStandard: string;
  bestUsedFor: string;
}

export interface ProcessRule {
  processName: string;
  minWallThickness: string;
  typicalTolerance: string;
  setupCostLevel: 'Low' | 'Medium' | 'High';
  unitCostLevel: 'Low' | 'Medium' | 'High';
  guidelines: string[];
}

export interface PresetComponent {
  id: string;
  name: string;
  category: string;
  material: string;
  description: string;
}

export const manufacturingMaterials: MechanicalMaterial[] = [
  {
    materialCode: "Al 6061-T6",
    materialGroup: "Aluminum Alloys",
    density: "2.70 g/cm³",
    tensileStrength: "310 MPa",
    elasticModulus: "68.9 GPa",
    machinabilityIndex: "90%",
    avgCostPerKg: 4.5
  },
  {
    materialCode: "SS 316L",
    materialGroup: "Stainless Steels",
    density: "8.00 g/cm³",
    tensileStrength: "485 MPa",
    elasticModulus: "193 GPa",
    machinabilityIndex: "36%",
    avgCostPerKg: 12.0
  },
  {
    materialCode: "Steel AISI 1018",
    materialGroup: "Carbon Steels / Mild Steel",
    density: "7.87 g/cm³",
    tensileStrength: "440 MPa",
    elasticModulus: "205 GPa",
    machinabilityIndex: "78%",
    avgCostPerKg: 2.2
  },
  {
    materialCode: "Brass C360",
    materialGroup: "Copper & Brass Alloys",
    density: "8.50 g/cm³",
    tensileStrength: "330 MPa",
    elasticModulus: "97 GPa",
    machinabilityIndex: "100%",
    avgCostPerKg: 9.5
  },
  {
    materialCode: "Ti-6Al-4V (Grade 5)",
    materialGroup: "Titanium Alloys",
    density: "4.43 g/cm³",
    tensileStrength: "950 MPa",
    elasticModulus: "113.8 GPa",
    machinabilityIndex: "22%",
    avgCostPerKg: 45.0
  },
  {
    materialCode: "Delrin (POM-C)",
    materialGroup: "Engineering Plastics",
    density: "1.41 g/cm³",
    tensileStrength: "65 MPa",
    elasticModulus: "2.8 GPa",
    machinabilityIndex: "110%",
    avgCostPerKg: 6.8
  }
];

export const toleranceGuidelines: ToleranceRule[] = [
  {
    class: "Fine (ISO 2768-f)",
    description: "High-precision components with matched fits, bearings, or seals",
    linearTolerance_1to10mm: "±0.05 mm",
    linearTolerance_10to50mm: "±0.10 mm",
    linearTolerance_50to120mm: "±0.15 mm",
    machiningMethod: "Precision grinding, EDM, fine milling"
  },
  {
    class: "Medium (ISO 2768-m)",
    description: "Standard mechanical components, general machined structures",
    linearTolerance_1to10mm: "±0.10 mm",
    linearTolerance_10to50mm: "±0.20 mm",
    linearTolerance_50to120mm: "±0.30 mm",
    machiningMethod: "Standard CNC milling, turning, boring"
  },
  {
    class: "Coarse (ISO 2768-c)",
    description: "Castings, sheet metal, structural welded elements",
    linearTolerance_1to10mm: "±0.20 mm",
    linearTolerance_10to50mm: "±0.50 mm",
    linearTolerance_50to120mm: "±0.80 mm",
    machiningMethod: "Manual drilling, laser cutting, casting"
  }
];

export const finishGuidelines: FinishRule[] = [
  {
    finishType: "As Machined",
    roughnessRa: "Ra 3.2 μm (125 μin)",
    relativeCostIndex: 1.0,
    industryStandard: "ISO N8",
    bestUsedFor: "Non-critical structural surfaces, mounting brackets, initial blanks"
  },
  {
    finishType: "Standard Machined",
    roughnessRa: "Ra 1.6 μm (63 μin)",
    relativeCostIndex: 1.25,
    industryStandard: "ISO N7",
    bestUsedFor: "Standard locating surfaces, static joints, threaded connectors"
  },
  {
    finishType: "Fine Machined / Ground",
    roughnessRa: "Ra 0.8 μm (32 μin)",
    relativeCostIndex: 1.8,
    industryStandard: "ISO N6",
    bestUsedFor: "Sliding shafts, seals, low-speed bearing locations, gear teeth faces"
  },
  {
    finishType: "Mirror Polished / Superfinish",
    roughnessRa: "Ra 0.2 μm (8 μin)",
    relativeCostIndex: 3.5,
    industryStandard: "ISO N4",
    bestUsedFor: "High-speed oil seals, optical assemblies, aerospace turbine bearings"
  }
];

export const processGuidelines: ProcessRule[] = [
  {
    processName: "CNC Milling",
    minWallThickness: "0.8 mm (metals), 1.5 mm (plastics)",
    typicalTolerance: "± 0.05 mm to ± 0.125 mm",
    setupCostLevel: "Medium",
    unitCostLevel: "Medium",
    guidelines: [
      "Avoid deep narrow cavities (keep length-to-diameter ratio below 4x).",
      "Prefer rounded internal vertical corners (tool radius must fit into pocket corners).",
      "Standardize thread sizes (M3, M4, M5, M8, M10, etc.) to minimize tool swaps."
    ]
  },
  {
    processName: "CNC Turning",
    minWallThickness: "0.5 mm (axisymmetric sections)",
    typicalTolerance: "± 0.025 mm to ± 0.075 mm",
    setupCostLevel: "Low",
    unitCostLevel: "Low",
    guidelines: [
      "Optimal for cylindrical, rotatory, concentric features.",
      "Keep parts balanced to avoid vibration at high rotational speeds.",
      "Bores should ideally be straight-through or standard step profiles."
    ]
  },
  {
    processName: "Sheet Metal Fabrication",
    minWallThickness: "0.5 mm to 6.0 mm (standard gauges)",
    typicalTolerance: "± 0.25 mm to ± 0.50 mm",
    setupCostLevel: "Medium",
    unitCostLevel: "Low",
    guidelines: [
      "Maintain a uniform sheet thickness throughout the entire component.",
      "Set inner bend radius at least equal to sheet thickness to avoid fracturing.",
      "Keep holes at least 2x sheet thickness away from bend lines."
    ]
  },
  {
    processName: "3D Printing (SLA/SLS/FDM/SLM)",
    minWallThickness: "1.0 mm (FDM), 0.5 mm (SLA), 1.2 mm (Metal SLM)",
    typicalTolerance: "± 0.1 mm to ± 0.3 mm",
    setupCostLevel: "Low",
    unitCostLevel: "High",
    guidelines: [
      "Ensure overhang angles are designed to minimize unneeded support material (generally keep under 45°).",
      "Account for thermal shrinkage and orientation warp factors.",
      "Metal SLM parts should include stress-relief heat treatment specifications."
    ]
  }
];

export const presetComponents: PresetComponent[] = [
  {
    id: "shaft_coupling",
    name: "Industrial Shaft Coupling",
    category: "Power Transmission",
    material: "SS 316L",
    description: "Design a stainless steel shaft coupling for connecting two high-torque industrial shafts of 25mm diameter with a keyway slot, rated for rust protection."
  },
  {
    id: "gearbox_bracket",
    name: "Gearbox Support Bracket",
    category: "Brackets & Structural",
    material: "Al 6061-T6",
    description: "Design an aluminum 6061 support bracket for securing a planetary gearbox to a steel frame. Requires four counter-bored mounting holes and high rigidity."
  },
  {
    id: "custom_impeller",
    name: "Fluid Mixing Impeller",
    category: "Fluid Flow",
    material: "Delrin (POM-C)",
    description: "Design a chemical-resistant mixing impeller with 3 helical blades, an internal thread core for a driving shaft, and high rotational balance for water processing."
  },
  {
    id: "flanged_bushing",
    name: "Heavy Duty Flanged Bushing",
    category: "Bearings & Hubs",
    material: "Brass C360",
    description: "Design a self-lubricating brass bushing with a mounting flange, an internal oil groove, and fine tolerance (+0.015 / +0.035 mm) with low friction surface finish."
  }
];
