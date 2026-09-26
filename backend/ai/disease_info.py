from ai.language_utils import translate_text

DISEASE_DB = {
    # APPLE
    "apple_black_rot": {
        "disease": "Apple Black Rot",
        "severity": "High",
        "reasons": "Caused by the fungus Botryosphaeria obtusa. It spreads during warm, wet spring conditions, overwintering in dead wood, mummified fruit, and bark cankers.",
        "cure": "Prune out dead or infected branches during the dormant season. Apply an approved organic or chemical copper-based fungicide at weekly intervals starting from silver tip stage.",
        "prevention": "Keep the orchard clean by removing fallen leaves and mummified fruits. Disinfect pruning tools with 70% isopropyl alcohol between trees."
    },
    "apple_cedar_rust": {
        "disease": "Apple Cedar Rust",
        "severity": "Medium",
        "reasons": "Caused by the fungus Gymnosporangium juniperi-virginianae. It requires both apple trees and Eastern Red Cedar trees to complete its complex lifecycle, with spores spreading via wind during wet spring weather.",
        "cure": "Spray protective fungicides containing Myclobutanil or copper before symptoms appear, starting from pink bud stage through petal fall.",
        "prevention": "Remove nearby red cedar trees or gall formations within a 2-mile radius if possible. Plant disease-resistant apple cultivars like Liberty or Freedom."
    },
    "apple_scab": {
        "disease": "Apple Scab",
        "severity": "High",
        "reasons": "Caused by the fungus Venturia inaequalis. It infects leaves and fruit under cool, humid, and rainy spring conditions, spreading rapidly via splashing rain.",
        "cure": "Apply systemic fungicides such as lime-sulfur or captan starting from green tip stage. Rake and destroy fallen leaves in autumn.",
        "prevention": "Prune trees to improve air circulation and allow leaves to dry quickly. Choose scab-resistant apple varieties and maintain balanced nitrogen levels."
    },
    "apple_healthy": {
        "disease": "Healthy Apple Leaf",
        "severity": "None",
        "reasons": "The leaf shows optimal chlorophyll levels, vibrant green color, and strong cellular structure with no signs of fungal or bacterial pathogen activity.",
        "cure": "No treatment required. The crop is in excellent condition.",
        "prevention": "Maintain regular watering schedules, balanced fertilizer applications, and routine field monitoring."
    },

    # CORN
    "corn_blight": {
        "disease": "Corn Northern Leaf Blight",
        "severity": "High",
        "reasons": "Caused by the fungus Exserohilum turcicum. It thrives in moderate temperatures (18-27°C) and high humidity or prolonged dew periods, spreading from crop debris.",
        "cure": "Apply standard triazole or strobilurin fungicides if symptoms appear on upper leaves before silking. Perform deep tillage to bury infected debris.",
        "prevention": "Rotate crops with non-grasses for at least one year. Select hybrid corn varieties with strong genetic resistance to Northern Leaf Blight."
    },
    "corn_cercospora": {
        "disease": "Corn Cercospora (Gray Leaf Spot)",
        "severity": "High",
        "reasons": "Caused by the fungus Cercospora zeae-maydis. It is favored by warm, humid weather and spreads from crop residues left on the soil surface in conservation tillage fields.",
        "cure": "Apply foliar fungicides like strobilurin or carboxamide early in the infection cycle. Harvest infected fields early to minimize stalk lodging.",
        "prevention": "Implement crop rotation and clean tillage to reduce surface residue. Plant high-yield resistant hybrid seeds."
    },
    "corn_rust": {
        "disease": "Corn Common Rust",
        "severity": "Medium",
        "reasons": "Caused by the fungus Puccinia sorghi. Spores are blown by wind from warm southern regions, thriving in cool temperatures (16-23°C) and high relative humidity.",
        "cure": "Apply protective fungicides containing strobilurins if infection occurs early in the season. Keep fields free of wild host plants like wood sorrel.",
        "prevention": "Utilize resistant corn hybrids. Schedule early planting to avoid peak spore migration seasons."
    },
    "corn_healthy": {
        "disease": "Healthy Corn Leaf",
        "severity": "None",
        "reasons": "The leaf exhibits healthy dark green color, robust veins, and optimal turgor pressure, indicating excellent nutrient uptake and photosynthesis.",
        "cure": "No treatment required. The corn crop is healthy.",
        "prevention": "Apply adequate nitrogen-rich fertilizers and ensure efficient drainage systems in the field."
    },

    # GRAPE
    "grape_black_rot": {
        "disease": "Grape Black Rot",
        "severity": "High",
        "reasons": "Caused by the fungus Guignardia bidwellii. It thrives in warm, wet weather and infects all young green parts of the vine including leaves, shoots, and berries.",
        "cure": "Apply effective fungicides such as mancozeb, captan, or myclobutanil starting from early bloom through fruit set. Remove and burn infected mummified berries.",
        "prevention": "Prune vines to maintain an open canopy for sunlight and air flow. Clean up vineyard floor post-harvest to reduce overwintering spores."
    },
    "grape_esca": {
        "disease": "Grape Esca (Black Measles)",
        "severity": "High",
        "reasons": "A complex wood disease caused by various fungi (Phaeomoniella chlamydospora, Phaeoacremonium aleophilum). It infects pruning wounds and decays the trunk's vascular system.",
        "cure": "No chemical cure exists for infected vine trunks. Remedial surgery (trunk renewal) or vine replacement is required. Apply wound protectants after pruning.",
        "prevention": "Prune during dry weather to minimize wound infection. Treat pruning cuts immediately with biological agents or copper-based paints."
    },
    "grape_leaf_blight": {
        "disease": "Grape Leaf Blight",
        "severity": "Medium",
        "reasons": "Caused by the fungus Pseudocercospora vitis. It affects mature leaves late in the season under warm, humid conditions, causing premature leaf drop.",
        "cure": "Apply copper fungicides or carbendazim to limit spore spread. Remove fallen infected leaves to reduce orchard load.",
        "prevention": "Maintain proper row spacing and weed control to reduce microclimatic humidity within the vine canopy."
    },
    "grape_healthy": {
        "disease": "Healthy Grape Leaf",
        "severity": "None",
        "reasons": "Clean leaf margins, vibrant chlorophyll pigmentation, and smooth surface texture demonstrate strong grape vine vigor and resistance.",
        "cure": "No treatment required. The vine is in peak health.",
        "prevention": "Perform regular pruning and ensure balanced drip irrigation to maintain plant health."
    },

    # MANGO
    "mango_anthracnose": {
        "disease": "Mango Anthracnose",
        "severity": "High",
        "reasons": "Caused by the fungus Colletotrichum gloeosporioides. It thrives in high humidity and frequent rainfall, attacking leaves, flowers, and developing fruits.",
        "cure": "Spray systemic fungicides like carbendazim or copper oxychloride at 15-day intervals during flowering and leaf flush. Hot water treatment (52°C for 5 mins) for harvested fruits.",
        "prevention": "Prune congested branches to increase sunlight penetration. Keep the basin clean and spray copper-based mixtures before monsoon seasons."
    },
    "mango_bacterial_canker": {
        "disease": "Mango Bacterial Canker",
        "severity": "High",
        "reasons": "Caused by the bacterium Xanthomonas campestris pv. mangiferaeindicae. It spreads via wind-blown rain and mechanical injuries, causing dark, water-soaked cankers on leaves and fruits.",
        "cure": "Spray Streptocycline (100 ppm) combined with Copper Oxychloride (0.3%) three times at 15-day intervals starting from leaf emergence.",
        "prevention": "Use healthy, disease-free planting material. Avoid causing physical damage to tree bark during farm operations."
    },
    "mango_die_back": {
        "disease": "Mango Die Back",
        "severity": "High",
        "reasons": "Caused by the fungus Lasiodiplodia theobromae. It causes twigs to dry out from the tip downwards, leading to vascular browning and complete branch death.",
        "cure": "Prune infected twigs 3-4 inches below the infected zone and paint the cut ends with Bordeaux paste. Spray copper oxychloride (0.3%) on the tree canopy.",
        "prevention": "Ensure balanced fertilization including potassium and micro-nutrients. Control stem borers which create entry wounds for the fungus."
    },
    "mango_powdery_mildew": {
        "disease": "Mango Powdery Mildew",
        "severity": "High",
        "reasons": "Caused by the fungus Oidium mangiferae. It thrives in cool, dry mornings followed by warm afternoons, covering flowers, leaves, and young fruits with white powdery spores.",
        "cure": "Spray wettable sulfur (0.2%) or systemic fungicides like hexaconazole or dinocap during flower panicle emergence and fruit set stages.",
        "prevention": "Prune orchards to improve air circulation. Keep trees well-irrigated to reduce water stress during flowering."
    },
    "mango_sooty_mould": {
        "disease": "Mango Sooty Mould",
        "severity": "Medium",
        "reasons": "Caused by various saprophytic fungi (Capnodium species). It grows on honeydew excreted by sucking pests like leafhoppers, aphids, and scale insects, blocking photosynthesis.",
        "cure": "First spray systemic insecticides like imidacloprid to control the sucking insects. Then spray starch solution (2%) or copper oxychloride to peel off the black mould layer.",
        "prevention": "Prune lower branches and maintain pest control schedules for sucking insects to prevent honeydew accumulation."
    },
    "mango_healthy": {
        "disease": "Healthy Mango Leaf",
        "severity": "None",
        "reasons": "Leaf is glossy green, thick, and free of any necrotic lesions, spots, or pest vectors, showing robust photosynthesis.",
        "cure": "No treatment required. The mango tree is in optimal health.",
        "prevention": "Apply organic manure annually and maintain proper irrigation intervals."
    }
}


def get_disease_info(key, lang="en"):
    key_lower = key.lower().replace(" ", "_")
    info = DISEASE_DB.get(key_lower)
    if not info:
        # Try matching with crop prefix
        for k, v in DISEASE_DB.items():
            if k.endswith(key_lower) or key_lower in k:
                info = v
                break
    
    if not info:
        info = {
            "disease": key.replace("_", " ").title(),
            "severity": "Unknown",
            "reasons": "No causes available in local database. Please consult an agricultural advisor.",
            "cure": "No chemical solution registered for this exact class. Monitor crop health and apply general bio-fungicides.",
            "prevention": "Maintain soil hygiene and clean agricultural equipment regularly."
        }

    # Translate if target language is not english
    if lang and lang.lower() not in ["en", "english"]:
        return {
            "disease": translate_text(info["disease"], lang),
            "severity": translate_text(info["severity"], lang),
            "reasons": translate_text(info["reasons"], lang),
            "cure": translate_text(info["cure"], lang),
            "prevention": translate_text(info["prevention"], lang)
        }
    
    return info.copy()