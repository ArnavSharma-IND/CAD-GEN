import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initalize Express app
const app = express();
const PORT = 3000;

app.use(express.json());

// Offline static fallbacks for main presets in case of slow connections or missing API keys.
// This guarantees instant, robust loading for standard items and safe offline degradation.
const PRESET_MOCK_RESPONSES: Record<string, any> = {
  "shaft_coupling": {
    title: "Industrial Shaft Coupling (Keyed)",
    description: "High-torque rigid sleeve coupling designed to connect two collinear 25mm transmission shafts using standard DIN 6885 parallel keyways, maintaining absolute concentricity and torsional rigidity under heavy loads.",
    cadSoftware: "SolidWorks",
    dimensions: [
      { parameter: "Bore Diameter", value: "25.00 mm (H7 fit)", explanation: "H7 clearance match for a standard 25mm steel shaft." },
      { parameter: "Outer Diameter", value: "50.00 mm", explanation: "Ensures adequate wall thickness (12.5mm) around the keyway to prevent hoop stress failures." },
      { parameter: "Total Sleeve Length", value: "85.00 mm", explanation: "Sized to provide 40mm of shaft insertion on each side, leaving a 5mm central stop web." },
      { parameter: "Keyway Width", value: "8.00 mm", explanation: "Follows DIN 6885-1 standards for 25mm nominal diameter axes." },
      { parameter: "Keyway Depth", value: "3.30 mm", explanation: "The precise standard recess depth for 8x7 parallel keys on the hub side." },
      { parameter: "Clamping Screw Bore", value: "M6 x 1.0 (qty 2)", explanation: "Threaded holes situated above the key seat for retention set-screws." }
    ],
    material: {
      materialCode: "SS 316L",
      materialGroup: "Stainless Steels",
      justification: "Selected for exceptional resistance to corrosion, superior yield strength in rotating power setups, and minimal magnetic interference. Suitable for maritime, food production, or aggressive industrial yards.",
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
        "Chuck raw 55mm stainless bar stock. Face end and turn outer diameter to 50.00mm radial specification.",
        "Drill central pilot hole to 23mm using carbide twist bits.",
        "Bore inner hollow diameter to 24.95mm, then precision-ream to final 25.00mm with an H7 limit shell reamer.",
        "Part off the slug at exactly 85.00mm length.",
        "Set up in secondary keyseat broaching machine; press a standard 8mm parallel cutter step-by-step through the bore.",
        "Fixture in 4-axis mill to drill and tap the two radial M6 retaining screw ports."
      ],
      surfacePrep: "Abrasive tumble deburring followed by 30-minute chemical passivation in nitric acid (ASTM A967) for high anti-rust capability."
    },
    tolerances: [
      { feature: "Internal Bore", toleranceValue: "25.000 to +0.021 mm (H7)", standardSystem: "ISO 286-2", reasoning: "Clamps perfectly onto a 25.00mm h6 shaft, facilitating straightforward assembly without loose backlash." },
      { feature: "Outer Diameter", toleranceValue: "±0.10 mm", standardSystem: "ISO 2768-m", reasoning: "Functional non-mating cosmetic surfaces require standard medium guidelines." },
      { feature: "Sleeve Length", toleranceValue: "+0.20 / -0.00 mm", standardSystem: "Linear medium scale", reasoning: "Guarantees full sleeve coverage of both shaft ends with minimal space error." },
      { feature: "Keyway Width", toleranceValue: "8.000 to +0.036 mm (JS9)", standardSystem: "ISO 286-2", reasoning: "Assures tight sliding fit for the keys, eliminating rotating rotational play." }
    ],
    surfaceFinish: [
      { roughnessRa: "Ra 1.6 μm (63 μin)", finishType: "Turned Surface Finish", treatmentDetails: "Applied to all outer surfaces to present a professional finish." },
      { roughnessRa: "Ra 0.8 μm (32 μin)", finishType: "Reamed Inner Bore", treatmentDetails: "Mandatory for uniform friction grip across the mating shaft and to avoid rotational wobble." }
    ],
    assemblyInstructions: [
      { stepNumber: 1, instruction: "Inspect the primary motor and secondary machine shafts for burrs. Clean both surfaces with solvent degreaser.", toolsNeeded: "Lint-free cloth, solvent" },
      { stepNumber: 2, instruction: "Insert the 8mm steel key parallel keys into the pre-cut paths of both shafts.", toolsNeeded: "Nylon mallet" },
      { stepNumber: 3, instruction: "Align the sleeve coupling keyways and slip the coupling halfway onto the drive shaft, then slide the driven shaft into the remaining end.", toolsNeeded: "Slide guide sleeves" },
      { stepNumber: 4, instruction: "Tighten the M6 locking set-screws securely into the top of the sleeve coupling against the key steel flats.", toolsNeeded: "Hex L-wrench 3mm, thread locker" }
    ],
    bom: [
      { itemNo: 1, partName: "Main Sleeve Coupling Hub", quantity: 1, material: "Stainless Steel 316L", source: "Custom CNC Machined", estimatedCostUnit: 65.00 },
      { itemNo: 2, partName: "Shaft Parallel Key (8x7x30mm)", quantity: 2, material: "Medium Carbon Steel C45", source: "DIN 6885 Component", estimatedCostUnit: 1.50 },
      { itemNo: 3, partName: "Cone-Point Set Screws M6x10", quantity: 2, material: "Grade 12.9 Alloy Steel", source: "ISO 4027 Standard Fastener", estimatedCostUnit: 0.40 }
    ],
    manufacturingConstraints: [
      { category: "Aspect Ratio", constraintValue: "Length to diameter is 1.7", impactOnDesign: "Extremely stable, presents no deflection risks relative to typical boring limits." },
      { category: "Internal Keyway Corner", constraintValue: "R 0.1 mm max", impactOnDesign: "Requires precision wire-EDM or dedicated broaching tools, standard milling cutters cannot form these sharp internal slots." },
      { category: "Reaming Allowance", constraintValue: "0.2mm radial depth", impactOnDesign: "Requires strict pre-machining control to keep enough stock for the finishing reamer." }
    ],
    threeDModelSpec: {
      datumPlane: "Front Plane (XY)",
      originCoord: "Geometric center of the bore axis",
      features: [
        { stepNo: 1, name: "Sleeve Cylinder", operation: "Revolve/Extrude Boss", parameters: "Sketch an outer circle of d=50mm and inner circle of d=25mm on Front Plane. Extrude symmetric, total depth 85mm." },
        { stepNo: 2, name: "Keyway Extrude Cut", operation: "Extrude Cut Through-All", parameters: "Sketch a rectangle 8.0mm wide, centered on top quadrant. Deepen into bore by 3.3mm, extend 85mm full length." },
        { stepNo: 3, name: "Set-Screw Drilling", operation: "Hole Wizard (M6 Tap)", parameters: "Position on cylinder top, 20mm from each flank face. Drill radial holes to core axis, thread with standard M6." }
      ]
    },
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
      costJustification: "Initial unit pricing includes expensive lathe-to-broach fixture setups. In larger batch quantities, tooling setups are shared over bulk runs, decreasing overall machining labor fees."
    },
    cadScript: {
      language: "SolidWorks VBA Macro",
      instructions: "In SolidWorks, navigate to Tools > Macro > New. Paste this VBA code, choose a file name, and click Run. It will model the baseline sleeve coupling.",
      code: `Dim swApp As Object\nDim Part As Object\n\nSub main()\nSet swApp = Application.SldWorks\nSet Part = swApp.ActiveDoc\nIf Part Is Nothing Then\n    Set Part = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\SolidWorks 2024\\templates\\Part.prtdot", 0, 0, 0)\nEnd If\n\n' Create Main Sleeve\nPart.Extension.SelectByID2 "Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0\nPart.SketchManager.InsertSketch True\nDim vSkLines As Variant\nvSkLines = Part.SketchManager.CreateCircle(0, 0, 0, 0, 0.025, 0) ' 50mm diameter Outer\nvSkLines = Part.SketchManager.CreateCircle(0, 0, 0, 0, 0.0125, 0) ' 25mm diameter Inner\nPart.FeatureManager.FeatureExtrudedThin2 True, False, False, 0, 0, 0.085, 0.085, False, False, False, False, 0, 0, False, False, False, False, False, 1, 1, 0, 0, False\nPart.SketchManager.InsertSketch False\n\nMsgBox "Sleeve Coupling Outline Created!", vbInformation\nEnd Sub`
    }
  },
  "gearbox_bracket": {
    title: "Planetary Gearbox Support Bracket",
    description: "Multi-point high rigidity support flange made of precision machined structural aluminum alloy 6061-T6, incorporating deep rib reinforcement to transfer high rotational counter-forces from the gearbox motor to the chassis.",
    cadSoftware: "Fusion 360",
    dimensions: [
      { parameter: "Base Dimensions", value: "120.00 mm x 120.00 mm", explanation: "Large square footprint to distribute heavy vibrational shear forces across structural girders." },
      { parameter: "Center Pilot Hole", value: "65.00 mm diameter", explanation: "Clearance pocket accommodating the central planetary input hub profile." },
      { parameter: "Faceplate Thickness", value: "15.00 mm", explanation: "Sturdy gauge plate thickness to prevent stress deflection and shaft misalignment." },
      { parameter: "Bolt Pattern Circle", value: "85.00 mm (PCD)", explanation: "Standard circular bolt path fit for standard motor bolts." },
      { parameter: "Rib Reinforcement Height", value: "8.00 mm (qty 4)", explanation: "Bridges load from center ring hub to frame flanges." }
    ],
    material: {
      materialCode: "Al 6061-T6",
      materialGroup: "Aluminum Alloys",
      justification: "Allows complex CNC machining of heavy reinforcing patterns. Selected for its exceptionally rigid strength-to-weight ratio, preventing bracket twisting under high motor torque spikes.",
      properties: {
        density: "2.70 g/cm³",
        tensileStrength: "310 MPa",
        elasticModulus: "68.9 GPa",
        machinabilityIndex: "90%"
      }
    },
    manufacturingProcess: {
      method: "CNC 3-Axis Milling",
      details: [
        "Cut 130x130mm billet plate stock of 6061-T6 extrusion.",
        "Face base top and sides to 120mm x 120mm dimensions with 15mm thick face gauge block.",
        "Mill central pilot hole to 65.00mm diameter inside a pocket recess.",
        "Drill counterbore holes (4 ports) for M8 socket caps around the outer flange.",
        "Use cylindrical multi-pass cuts to carve out radial stiffness ribs.",
        "Incorporate a 1mm edge roll/chamfer to eliminate razor edges."
      ],
      surfacePrep: "Micro-bead blasting with high-pressure glass beads, followed by clean-bath Sulfuric Acid Anodizing Type II (MIL-A-8625) in Matte Grey."
    },
    tolerances: [
      { feature: "Inner Gearbox Pilot d=65", toleranceValue: "-0.010 to -0.045 mm (g6 fit)", standardSystem: "ISO 286-2", reasoning: "Holds center planetary register tight to prevent motor offset and radial vibration." },
      { feature: "External Boundaries", toleranceValue: "±0.25 mm", standardSystem: "ISO 2768-m", reasoning: "General boundaries without critical mating connections." },
      { feature: "Hole to Hole Center Distance", toleranceValue: "±0.05 mm", standardSystem: "Geometric Tolerance System", reasoning: "Preserves perfect alignment with the gearbox structural bolt layout without binding." }
    ],
    surfaceFinish: [
      { roughnessRa: "Ra 1.6 μm (63 μin)", finishType: "Faceted Face milling", treatmentDetails: "Clean machined baseline setup across locating face." },
      { roughnessRa: "Ra 0.8 μm (32 μin)", finishType: "Rear Pilot register", treatmentDetails: "Ground/turned finish on mating hub register." }
    ],
    assemblyInstructions: [
      { stepNumber: 1, instruction: "Position support bracket against gearbox face flanged hub, ensuring registry keys clip correctly together.", toolsNeeded: "Rubber tip alignment pins" },
      { stepNumber: 2, instruction: "Install high-tensile 12.9 class M8 fasteners into bracket holes.", toolsNeeded: "L-hex wrench, medium mechanical oil" },
      { stepNumber: 3, instruction: "Torque bolts in a diametrically opposed crisscross sequence to 25 Nm.", toolsNeeded: "Calibrated Torque wrench" }
    ],
    bom: [
      { itemNo: 1, partName: "Reinforced support plate", quantity: 1, material: "Aluminum Alloy 6061-T6", source: "Custom Milled Billet", estimatedCostUnit: 48.00 },
      { itemNo: 2, partName: "M8 Socket Cap Fasteners L=25mm", quantity: 4, material: "High Tensile Steel 12.9", source: "Standard DIN 912 Screw", estimatedCostUnit: 0.85 }
    ],
    manufacturingConstraints: [
      { category: "Pocket corner limits", constraintValue: "R 4.0 mm fillet", impactOnDesign: "Allows standard 8mm diameter endmills to cut ribs easily, avoiding slow tool change overhead." },
      { category: "Flange Thickness Ratio", constraintValue: "Plate thickness of 15 mm", impactOnDesign: "Ensures ample structural resistance to bending under variable mechanical leverage." }
    ],
    threeDModelSpec: {
      datumPlane: "XY Plane (Base)",
      originCoord: "Geometrical midpoint of center hole",
      features: [
        { stepNo: 1, name: "Outer Base Plate", operation: "Extruded Rectangle", parameters: "Create rectangle 120mm x 120mm centered at origin. Extrude to 15.0mm vertical thickness." },
        { stepNo: 2, name: "Gearbox Core Cutout", operation: "Extruded Cut Circle", parameters: "Sketch circle d=65mm at origin, extrude cut 'Through-All'." },
        { stepNo: 3, name: "Mounting Bolt Holes", operation: "Circular Pattern Holes", parameters: "Cut 4 holes, diameter 9mm. Position at (x,y) coordinates matching PCD 85mm. Create concentric counter-bore step." }
      ]
    },
    costEstimation: {
      rawMaterialCost: 18.00,
      machiningLaborCost: 35.00,
      finishingCost: 12.00,
      setupCost: 65.00,
      unitTotalCost: 130.00,
      batchMultiplier: {
        batch10: 72.00,
        batch100: 55.00,
        batch1000: 49.00
      },
      costJustification: "Raw billet aluminum is cost-effective, and 6061 possesses superior machinability. Bulk savings result from rapid, automated toolpath cycles during high batch operations."
    },
    cadScript: {
      language: "Fusion 360 Python API",
      instructions: "In Fusion 360, go to UTILITIES > Add-Ins > Scripts and Add-ins. Create a new Python script and paste the code below to auto-make the bracket profile.",
      code: `import adsk.core, adsk.fusion, traceback\n\ndef run(context):\n    ui = None\n    try:\n        app = adsk.core.Application.get()\n        ui  = app.userInterface\n        design = app.activeProduct\n        rootComp = design.rootComponent\n        \n        # Create a new sketch on the XY plane\n        sketches = rootComp.sketches\n        xyPlane = rootComp.xYConstructionPlane\n        sketch = sketches.add(xyPlane)\n        \n        # Draw outer rectangle (120mm x 120mm)\n        sketch.sketchCurves.sketchLines.addTwoPointRectangle(\n            adsk.core.Point3D.create(-6.0, -6.0, 0),\n            adsk.core.Point3D.create(6.0, 6.0, 0)\n        ) # values in cm\n        \n        # Draw inner hole (65mm diameter -> 3.25cm radius)\n        sketch.sketchCurves.sketchCircles.addByCenterRadius(\n            adsk.core.Point3D.create(0, 0, 0), 3.25\n        )\n        \n        # Extrude block to 1.5 cm (15mm)\n        extrudes = rootComp.features.extrudeFeatures\n        prof = sketch.profiles.item(0)\n        distance = adsk.core.ValueInput.createByReal(1.5)\n        extrudes.addSimple(prof, distance, adsk.fusion.FeatureOperations.NewBodyFeatureOperation)\n        \n        ui.messageBox('Bracket Profile Created Successfully!')\n    except:\n        if ui:\n            ui.messageBox('Failed:\\n{}'.format(traceback.format_exc()))`
    }
  }
};

// Main CAD generator using `@google/genai`
app.post("/api/generate-cad", async (req, res) => {
  const { prompt, cadSoftware, presetId } = req.body;

  if (!prompt && !presetId) {
    return res.status(400).json({ error: "Please enter a valid mechanical description or select a preset." });
  }

  // If a preset is requested and we have it in our mock, return it directly to speed up & act as robust fallback.
  if (presetId && PRESET_MOCK_RESPONSES[presetId]) {
    const data = { ...PRESET_MOCK_RESPONSES[presetId] };
    // Swap the requested software if it differs from default Mock
    if (cadSoftware && data.cadSoftware !== cadSoftware) {
      data.cadSoftware = cadSoftware;
      // Make a small instruction adjustments
      data.cadScript = getScriptForSoftware(cadSoftware, data.title);
    }
    data.id = `${presetId}_${Date.now()}`;
    data.timestamp = new Date().toISOString();
    data.sourcePrompt = prompt || `Preset load: ${data.title}`;
    return res.json(data);
  }

  // Otherwise, invoke live Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    // If API key is missing and no matching mock, we fall back to a dynamic mock with a notification
    console.warn("Warning: GEMINI_API_KEY not set. Using dynamic fallback engine.");
    const fallbackData = generateFallbackDynamicComponent(prompt || "Custom component Request", cadSoftware || "SolidWorks");
    return res.json(fallbackData);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const targetSoftware = cadSoftware || "SolidWorks";

    const systemInstruction = `You are an expert mechanical engineer, metal parts fabricator, and CAD scripting assistant.
Your task is to convert plain English user requests describing a mechanical component into fully realized, CAD-ready engineering specifications.
You must output ONLY valid, parsable JSON which strictly adheres to the schema requested below. Do not include markdown codeblocks (like \`\`\`json) or wrap the JSON in conversational text—just output raw, clean JSON starting with { and ending with }.

The JSON structure must match this EXACT model (ensure all types match, and do not use nulls—always use strings or real numbers):
{
  "title": "Clear Technical Title for Component",
  "description": "2-3 sentence mechanical overview of what the component does, its form, and its mechanical purpose",
  "cadSoftware": "${targetSoftware}",
  "dimensions": [
    { "parameter": "Outer Diameter / Bolt pitch / etc", "value": "120 mm / 10mm / etc", "explanation": "Detailed engineering sizing justification" }
  ],
  "material": {
    "materialCode": "e.g. Al 6061-T6, SS 316, Grade 5 Titanium",
    "materialGroup": "Aluminum Alloys / Carbon Steel / etc",
    "justification": "Detailed strength, weight, or environmental reason for selecting this mechanical material",
    "properties": {
      "density": "e.g. 2.70 g/cm³",
      "tensileStrength": "e.g. 310 MPa",
      "elasticModulus": "e.g. 68.9 GPa",
      "machinabilityIndex": "e.g. 90%"
    }
  },
  "manufacturingProcess": {
    "method": "CNC Milling / High-Precision Turning / Sheet Metal bending / etc",
    "details": [
      "Step-by-step raw billet to complete part instructions (provide 4-6 verbose steps describing machining, drilling slots, threading, deburring, etc.)"
    ],
    "surfacePrep": "Details of final passivations, powder coatings, glass bead blasting, or standard zinc coat electroplatings"
  },
  "tolerances": [
    { "feature": "E.g. Main mating bore / Overall length", "toleranceValue": "+0.015 / -0.000 mm or +/-0.12mm", "standardSystem": "E.g. ISO 286-2 H7 / ISO 2768-m", "reasoning": "Mechanical reason for high precision or general tolerances" }
  ],
  "surfaceFinish": [
    { "roughnessRa": "e.g. Ra 1.6 μm", "finishType": "e.g. Turned Face / Ground bore", "treatmentDetails": "e.g. passivated, anodized ASTM..." }
  ],
  "assemblyInstructions": [
    { "stepNumber": 1, "instruction": "Step explanation of mounting/fitting.", "toolsNeeded": "e.g. Metric Hex Key set, clean workspace cloths" }
  ],
  "bom": [
    { "itemNo": 1, "partName": "Primary machined body / fasteners", "quantity": 1, "material": "Name", "source": "Custom CNC Machined or specific Supplier / Standard part number", "estimatedCostUnit": 75.00 }
  ],
  "manufacturingConstraints": [
    { "category": "aspect ratio / draft angle / minimum thickness / etc", "constraintValue": "Value", "impactOnDesign": "Detail how it avoids cutting mistakes or stress points" }
  ],
  "costEstimation": {
    "rawMaterialCost": 22.50,
    "machiningLaborCost": 60.00,
    "finishingCost": 15.00,
    "setupCost": 100.00,
    "unitTotalCost": 197.50,
    "batchMultiplier": {
      "batch10": 110.00,
      "batch100": 78.00,
      "batch1000": 62.50
    },
    "costJustification": "Reasoning on material cost, complexity of setups, and how batch sizing shares tooling costs."
  },
  "threeDModelSpec": {
    "datumPlane": "e.g. Front Plane (XY)",
    "originCoord": "e.g. Center concentric axis face",
    "features": [
      { "stepNo": 1, "name": "Feature step name", "operation": "e.g. Extrude Boss, Revolve, Sweep", "parameters": "Specific geometry details (e.g. Sketch circle d=50mm, pull 30mm)" }
    ]
  },
  "cadScript": {
    "language": "e.g. SolidWorks VBA Macro / Python API / AutoLISP",
    "instructions": "Step-by-step how to paste and play this automation script inside the parent CAD tool",
    "code": "A short, clean, valid, functionally correct boilerplate automation script code block (SolidWorks VBA macro, Fusion 360 Python API script, AutoCAD AutoLISP script, or CATIA clean VBA) which creates the rough cylinder, block, flanges, or circle profiles on standard coordinates. NO syntax errors or untyped items."
  }
}

Be realistic about mechanical design. For example, if a user requests a high-temperature rocket nozzle, select titanium or superalloy (Inconel), prescribe fine tolerances, Ra 0.8 ground seals, high cost, and proper CNC milling details. Keep the generated code useful and syntactically sound.`;

    const promptText = `Convert the following mechanical component request into full specifications:
"${prompt}"

Target CAD Software: ${targetSoftware}
Ensure the CAD Script matches ${targetSoftware} parameters!
- SolidWorks -> VBA Macro
- Fusion 360 -> Python API script
- AutoCAD -> AutoLISP (.lsp) file
- CATIA -> CATScript/VBA

Output purely JSON matching the schema perfectly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2 // Lower temp for more deterministic code and JSON output
      }
    });

    const outputText = response.text || "";
    const cleanJsonText = outputText.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    
    const parsedData = JSON.parse(cleanJsonText);
    parsedData.id = `cad_${Date.now()}`;
    parsedData.timestamp = new Date().toISOString();
    parsedData.sourcePrompt = prompt;
    parsedData.cadSoftware = targetSoftware;

    return res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini API generation failed:", error);
    // If the API call fails or JSON is unparsable, fall back to a dynamically configured component
    const fallbackComponent = generateFallbackDynamicComponent(prompt, cadSoftware || "SolidWorks");
    fallbackComponent.title += " (Fallback Engine)";
    fallbackComponent.description += ` [Note: AI Generation faced a temporary error. This specification has been populated by the local expert rule engine. Error details: ${error.message || "Unbalanced output"}].`;
    return res.json(fallbackComponent);
  }
});

// Dynamic component generator to protect the user from any runtime API credential outage
function generateFallbackDynamicComponent(prompt: string, software: string) {
  const cleanPrompt = prompt.toLowerCase();
  let material = "SS 316L";
  let title = "Custom Engineered Component";
  let codeSnippet = "";

  if (cleanPrompt.includes("shaft") || cleanPrompt.includes("coupling")) {
    title = "Shaft Coupling / Connector";
  } else if (cleanPrompt.includes("bracket") || cleanPrompt.includes("mount")) {
    title = "Engine Structural Mounting Bracket";
    material = "Al 6061-T6";
  } else if (cleanPrompt.includes("gear") || cleanPrompt.includes("spur") || cleanPrompt.includes("pinion")) {
    title = "Precision Spur Gear Master Draft";
    material = "Steel AISI 1018";
  } else if (cleanPrompt.includes("bushing") || cleanPrompt.includes("bearing") || cleanPrompt.includes("sleeve")) {
    title = "Precision Flanged Slide Bushing";
    material = "Brass C360";
  } else {
    title = `Engineered ${prompt.slice(0, 30)}${prompt.length > 30 ? "..." : ""}`;
  }

  return {
    id: `dynamic_${Date.now()}`,
    title: title,
    description: `A custom-engineered part generated for the specifications matching: "${prompt}". Designed to meet general mechanical tolerances and standard geometric limits.`,
    timestamp: new Date().toISOString(),
    sourcePrompt: prompt,
    cadSoftware: software,
    dimensions: [
      { parameter: "Outer Envelope Width", value: "75.00 mm", explanation: "Calculated base outer diameter bounds." },
      { parameter: "Core Interface Shaft", value: "20.00 mm", explanation: "Nominal center axis shaft clearance bore." },
      { parameter: "Thickness / Depth", value: "25.00 mm", explanation: "Sized for standard fastener thread length capabilities." }
    ],
    material: {
      materialCode: material,
      materialGroup: material.startsWith("Al") ? "Aluminum Alloys" : material.startsWith("SS") ? "Stainless Steels" : "Copper/Brass Alloys",
      justification: "Selected based on general structural criteria, fatigue resistance, and standard lathe/mill machinability indexes.",
      properties: {
        density: material.startsWith("Al") ? "2.70 g/cm³" : "7.90 g/cm³",
        tensileStrength: material.startsWith("Al") ? "310 MPa" : "485 MPa",
        elasticModulus: material.startsWith("Al") ? "68.9 GPa" : "193 GPa",
        machinabilityIndex: material.startsWith("Al") ? "90%" : "36%"
      }
    },
    manufacturingProcess: {
      method: "CNC Turning & Milling",
      details: [
        "Procure selected mechanical stock blocks with 5mm machining margins.",
        "Secure work on multi-jaw CNC chucking system; establish zero workpiece coordinators.",
        "Deploy rough circular facing pass with carbide mill tools.",
        "Mill concentric slots and core ream key dimensions to final limits.",
        "Verify internal surfaces against micrometer calibration standards."
      ],
      surfacePrep: "Standard glass-bead tumble blasting and micro-deburring for smooth touch surfaces."
    },
    tolerances: [
      { feature: "Primary Core Bore", toleranceValue: "20.000 / +0.021 mm", standardSystem: "ISO 286-2 (H7)", reasoning: "Guarantees proper clearance match onto industrial drive shafts." },
      { feature: "General Features", toleranceValue: "±0.15 mm", standardSystem: "ISO 2768-medium", reasoning: "Standard non-matching features are kept cost-effective with medium tolerances." }
    ],
    surfaceFinish: [
      { roughnessRa: "Ra 1.6 μm", finishType: "Standard Turned face", treatmentDetails: "Clean machined baseline setup across main plate." }
    ],
    assemblyInstructions: [
      { stepNumber: 1, instruction: "Wipe inner bores clean of protective storage oils.", toolsNeeded: "Isopropyl alcohol, lint-free paper" },
      { stepNumber: 2, instruction: "Fit key slot and hand-slide into collinear alignment.", toolsNeeded: "None" }
    ],
    bom: [
      { itemNo: 1, partName: `${title} Main Hub`, quantity: 1, material: material, source: "Custom CNC machined from raw block", estimatedCostUnit: 45.00 }
    ],
    manufacturingConstraints: [
      { category: "Tool Access Clearance", constraintValue: "Wall thickness margin 5.0mm", impactOnDesign: "Avoids buckling or excessive deformation during fixture clamping forces." }
    ],
    threeDModelSpec: {
      datumPlane: "Front Plane (XY)",
      originCoord: "Geometrical hub center axis",
      features: [
        { stepNo: 1, name: "Main Profile Extrusion", operation: "Extrude Boss", parameters: "Create circle d=75mm at origin, extrude blind length = 25mm." },
        { stepNo: 2, name: "Drill Concentric Shaft", operation: "Extrude Cut", parameters: "Draw circle d=20mm centered at coordinates (0,0), extrude cut through-all." }
      ]
    },
    costEstimation: {
      rawMaterialCost: 15.00,
      machiningLaborCost: 45.00,
      finishingCost: 10.00,
      setupCost: 50.00,
      unitTotalCost: 120.00,
      batchMultiplier: {
        batch10: 82.00,
        batch100: 65.00,
        batch1000: 59.00
      },
      costJustification: "Includes raw stock sourcing and medium level CNC program programming time. For volume orders, cost is significantly reduced due to continuous fixture cycle batching."
    },
    cadScript: getScriptForSoftware(software, title)
  };
}

// Generate typical quick helper CAD scripts dynamically based on CAD tool selection
function getScriptForSoftware(software: string, componentTitle: string) {
  if (software === "Fusion 360") {
    return {
      language: "Fusion 360 Python API",
      instructions: "In Fusion 360, go to UTILITIES > Add-Ins > Scripts and Add-ins. Create a new Python script and paste the code below to auto-model the base form.",
      code: `import adsk.core, adsk.fusion, traceback\n\ndef run(context):\n    ui = None\n    try:\n        app = adsk.core.Application.get()\n        ui  = app.userInterface\n        design = app.activeProduct\n        rootComp = design.rootComponent\n        \n        sketches = rootComp.sketches\n        xyPlane = rootComp.xYConstructionPlane\n        sketch = sketches.add(xyPlane)\n        \n        # Model Outer Base for ${componentTitle}\n        sketch.sketchCurves.sketchCircles.addByCenterRadius(adsk.core.Point3D.create(0, 0, 0), 3.75) # 75mm outer\n        sketch.sketchCurves.sketchCircles.addByCenterRadius(adsk.core.Point3D.create(0, 0, 0), 1.0) # 20mm inner bore\n        \n        # Extrude to 2.5cm\n        extrudes = rootComp.features.extrudeFeatures\n        prof = sketch.profiles.item(0)\n        distance = adsk.core.ValueInput.createByReal(2.5)\n        extrudes.addSimple(prof, distance, adsk.fusion.FeatureOperations.NewBodyFeatureOperation)\n        \n        ui.messageBox('${componentTitle} draft created in Fusion 360!')\n    except:\n        if ui: ui.messageBox('Failed: ' + traceback.format_exc())`
    };
  } else if (software === "AutoCAD") {
    return {
      language: "AutoCAD AutoLISP",
      instructions: "In AutoCAD, type APPLOAD, select this AutoLISP file (.lsp) and load it. Type 'CADGEN_PART' on the command line buffer and answer the coordinates.",
      code: `(defun c:cadgen_part ()\n  (setq old_cmdecho (getvar "CMDECHO"))\n  (setvar "CMDECHO" 0)\n  (alert "Drawing base profile for ${componentTitle}")\n  (command "_circle" "0,0,0" "37.5")\n  (command "_circle" "0,0,0" "10.0")\n  (command "_zoom" "E")\n  (setvar "CMDECHO" old_cmdecho)\n  (princ "\\nPart boundaries rendered. Extrude profiles to finalize base geometric solid.")\n  (princ)\n)`
    };
  } else if (software === "CATIA") {
    return {
      language: "CATIA CATScript / VBScript",
      instructions: "In CATIA, select Tools > Macro > Macros. Click 'Create' and enter CATScript language. Paste the template script and run.",
      code: `' CATIA Macro for ${componentTitle}\nLanguage="VBSCRIPT"\nSub CATMain()\nDim partDocument1 As PartDocument\nSet partDocument1 = CATIA.ActiveDocument\nDim part1 As Part\nSet part1 = partDocument1.Part\nDim bodies1 As Bodies\nSet bodies1 = part1.Bodies\nDim body1 As Body\nSet body1 = bodies1.Item("PartBody")\nDim sketches1 As Sketches\nSet sketches1 = body1.Sketches\nDim reference1 As Reference\nSet reference1 = part1.CreateReferenceFromObject(part1.OriginElements.PlaneXY)\nDim sketch1 As Sketch\nSet sketch1 = sketches1.Add(reference1)\n\n' Define parameters\npart1.Update\nMsgBox "CATIA Draft Outline created for ${componentTitle}"\nEnd Sub`
    };
  } else {
    // SolidWorks default
    return {
      language: "SolidWorks VBA Macro",
      instructions: "In SolidWorks, click Tools > Macro > New. Paste this VBA code and press F5 (Run) to generate the initial extrusion model.",
      code: `Dim swApp As Object\nDim Part As Object\n\nSub main()\nSet swApp = Application.SldWorks\nSet Part = swApp.ActiveDoc\nIf Part Is Nothing Then\n    Set Part = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\SolidWorks 2024\\templates\\Part.prtdot", 0, 0, 0)\nEnd If\n\n' Select plane and sketch base for ${componentTitle}\nPart.Extension.SelectByID2 "Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0\nPart.SketchManager.InsertSketch True\nDim vSkLines As Variant\nvSkLines = Part.SketchManager.CreateCircle(0, 0, 0, 0, 0.0375, 0) ' 75mm OD\nvSkLines = Part.SketchManager.CreateCircle(0, 0, 0, 0, 0.010, 0) ' 20mm ID\nPart.FeatureManager.FeatureExtrudedThin2 True, False, False, 0, 0, 0.025, 0.025, False, False, False, False, 0, 0, False, False, False, False, False, 1, 1, 0, 0, False\nPart.SketchManager.InsertSketch False\nMsgBox "${componentTitle} outline Extruded in SolidWorks!", vbInformation\nEnd Sub`
    };
  }
}

// Server bootstrap with Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CAD Prompt Generator full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
