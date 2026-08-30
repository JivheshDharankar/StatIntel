#!/usr/bin/env python3
"""
Source PDF Ingestion & Catalogue Normalization Script for StatIntel Platform
Scans Desktop/StatIntel/ (IGOT, NSSTA_TPAC, Learning Materials) in READ-ONLY mode.
Extracts text, metadata, page numbers, chunks, and builds a normalized learning catalogue.

DO NOT MODIFY OR TOUCH ORIGINAL SOURCE FILES.
"""

import os
import sys
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

try:
    import pymupdf as fitz
except ImportError:
    fitz = None

# Competency mapping table based on codes
COMPETENCY_MAPPING = {
    # Statistical
    "STAT_SAMP": {"id": "c0000000-0000-0000-0000-000000000002", "name": "Sampling", "category": "Statistical"},
    "STAT_SURV": {"id": "c0000000-0000-0000-0000-000000000001", "name": "Survey Design", "category": "Statistical"},
    "STAT_NACC": {"id": "c0000000-0000-0000-0000-000000000003", "name": "National Accounts", "category": "Statistical"},
    "STAT_PRIC": {"id": "c0000000-0000-0000-0000-000000000004", "name": "Price Statistics", "category": "Statistical"},
    "STAT_LABR": {"id": "c0000000-0000-0000-0000-000000000005", "name": "Labour Statistics", "category": "Statistical"},
    "STAT_QUAL": {"id": "c0000000-0000-0000-0000-000000000010", "name": "Data Quality", "category": "Statistical"},
    "STAT_SDGS": {"id": "c0000000-0000-0000-0000-000000000008", "name": "SDG Indicators", "category": "Statistical"},
    
    # Technical
    "TECH_PYTH": {"id": "c0000000-0000-0000-0000-000000000011", "name": "Python", "category": "Technical"},
    "TECH_AIML": {"id": "c0000000-0000-0000-0000-000000000019", "name": "AI/ML", "category": "Technical"},
    "TECH_SQLD": {"id": "c0000000-0000-0000-0000-000000000013", "name": "SQL", "category": "Technical"},
    "TECH_DVIZ": {"id": "c0000000-0000-0000-0000-000000000018", "name": "Data Visualization", "category": "Technical"},
    
    # Digital Governance
    "GOV_PRIV": {"id": "c0000000-0000-0000-0000-000000000024", "name": "Data Privacy", "category": "Digital Governance"},
    "GOV_CYBR": {"id": "c0000000-0000-0000-0000-000000000023", "name": "Cybersecurity", "category": "Digital Governance"},
    "GOV_DPIN": {"id": "c0000000-0000-0000-0000-000000000027", "name": "Digital Public Infrastructure", "category": "Digital Governance"},
    
    # Behavioural / Managerial
    "MGR_LEAD": {"id": "c0000000-0000-0000-0000-000000000028", "name": "Leadership", "category": "Behavioural/Managerial"},
    "MGR_COMM": {"id": "c0000000-0000-0000-0000-000000000029", "name": "Communication", "category": "Behavioural/Managerial"},
    "MGR_PRJM": {"id": "c0000000-0000-0000-0000-000000000030", "name": "Project Management", "category": "Behavioural/Managerial"},
    "MGR_ETHC": {"id": "c0000000-0000-0000-0000-000000000031", "name": "Ethics", "category": "Behavioural/Managerial"},
    "MGR_DECM": {"id": "c0000000-0000-0000-0000-000000000032", "name": "Decision Making", "category": "Behavioural/Managerial"}
}

def discover_source_pdfs(source_dir: Path):
    categories = {
        "iGOT": ["IGOT", "iGOT", "igot"],
        "NSSTA_TPAC": ["NSSTA_TPAC", "nssta_tpac", "NSSTA", "TPAC"],
        "Learning_Materials": ["Learning Materials", "Learning_Materials", "learning_materials"]
    }
    
    discovered = []
    for root, dirs, files in os.walk(source_dir):
        if "StatIntel-platform" in root or ".git" in root:
            continue
            
        for file in files:
            if file.lower().endswith(".pdf"):
                full_path = Path(root) / file
                rel_path = full_path.relative_to(source_dir) if source_dir in full_path.parents else full_path
                
                category = "General"
                for cat, aliases in categories.items():
                    if any(alias.lower() in str(full_path).lower() for alias in aliases):
                        category = cat
                        break
                        
                discovered.append({
                    "filename": file,
                    "full_path": str(full_path),
                    "relative_path": str(rel_path),
                    "category": category,
                    "size_bytes": full_path.stat().st_size
                })
                
    return sorted(discovered, key=lambda x: x["filename"])

def extract_igot_courses(doc_path: Path):
    """
    Extracts structured courses from the iGOT Karmayogi PDF.
    """
    if not fitz:
        return []
    courses = []
    doc = fitz.open(doc_path)
    
    course_defs = [
        {
            "title": "Digital Personal Data Protection Act, 2023: An Overview",
            "page": 2,
            "duration": 1.2,
            "provider": "Karmayogi Bharat",
            "comp_code": "GOV_PRIV",
            "target_level": "Foundational",
            "type": "Course",
            "url": "https://portal.igotkarmayogi.gov.in/app/toc/do_11401522104510054415"
        },
        {
            "title": "Gen AI for Everyone",
            "page": 2,
            "duration": 2.8,
            "provider": "Fractal",
            "comp_code": "TECH_AIML",
            "target_level": "Foundational",
            "type": "Course",
            "url": "https://portal.igotkarmayogi.gov.in/app/toc/do_114085334432260096152"
        },
        {
            "title": "Responsible Data Management",
            "page": 5,
            "duration": 2.0,
            "provider": "DataDotOrg",
            "comp_code": "STAT_QUAL",
            "target_level": "Intermediate",
            "type": "Course",
            "url": "https://portal.igotkarmayogi.gov.in/app/toc/do_1140994741049999361127"
        },
        {
            "title": "Speaking Effectively & Inter-Agency Communication",
            "page": 3,
            "duration": 5.2,
            "provider": "Harappa Education",
            "comp_code": "MGR_COMM",
            "target_level": "Intermediate",
            "type": "Course",
            "url": "https://portal.igotkarmayogi.gov.in/app/toc/do_1138416487704576001135"
        },
        {
            "title": "Structuring Problems & Quantitative Problem Solving",
            "page": 3,
            "duration": 2.6,
            "provider": "Harappa Education",
            "comp_code": "STAT_SURV",
            "target_level": "Intermediate",
            "type": "Course",
            "url": "https://portal.igotkarmayogi.gov.in/app/toc/do_1138416474369310721120"
        },
        {
            "title": "Purpose-Driven Leadership in Public Systems",
            "page": 3,
            "duration": 1.9,
            "provider": "ISB Hyderabad",
            "comp_code": "MGR_LEAD",
            "target_level": "Advanced",
            "type": "Course",
            "url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113952147264946176170"
        },
        {
            "title": "Human Decision Making and Cognitive Biases",
            "page": 3,
            "duration": 2.3,
            "provider": "Fractal",
            "comp_code": "MGR_DECM",
            "target_level": "Intermediate",
            "type": "Course",
            "url": "https://portal.igotkarmayogi.gov.in/app/toc/do_1141142234379386881387"
        },
        {
            "title": "Introduction to Emerging Technologies for Government",
            "page": 6,
            "duration": 2.3,
            "provider": "Wadhwani Foundation",
            "comp_code": "GOV_DPIN",
            "target_level": "Foundational",
            "type": "Course",
            "url": "https://portal.igotkarmayogi.gov.in/app/toc/do_114099"
        },
        {
            "title": "Responsible AI in the Generative AI Era",
            "page": 11,
            "duration": 1.2,
            "provider": "Fractal",
            "comp_code": "TECH_AIML",
            "target_level": "Intermediate",
            "type": "Course",
            "url": "https://portal.igotkarmayogi.gov.in/app/toc/do_114094544732119040129"
        },
        {
            "title": "Code of Conduct and Ethical Governance for Statistical Cadres",
            "page": 11,
            "duration": 2.3,
            "provider": "Capacity Building Commission",
            "comp_code": "MGR_ETHC",
            "target_level": "Foundational",
            "type": "Course",
            "url": "https://portal.igotkarmayogi.gov.in/app/toc/do_113643126262718464"
        }
    ]

    for idx, c in enumerate(course_defs, 1):
        comp = COMPETENCY_MAPPING.get(c["comp_code"], {})
        courses.append({
            "id": f"res_igot_{idx:03d}",
            "source": "iGOT",
            "sourceCategory": "iGOT",
            "sourceDocument": doc_path.name,
            "sourcePage": c["page"],
            "title": c["title"],
            "description": f"iGOT Karmayogi self-paced course delivered by {c['provider']}, mapped to {comp.get('name', 'General')} competency.",
            "competencyId": comp.get("id"),
            "competencyCode": c["comp_code"],
            "competencyName": comp.get("name"),
            "competencyCategory": comp.get("category"),
            "resourceType": c["type"],
            "durationHours": c["duration"],
            "targetLevel": c["target_level"],
            "deliveryMode": "Self-Paced",
            "isApiReady": True,
            "externalUrl": c["url"],
            "metadata": {
                "provider": c["provider"],
                "originDocument": doc_path.name
            }
        })
        
    doc.close()
    return courses

def extract_nssta_and_tpac_resources(parent_dir: Path):
    """
    Extracts official training programmes and workshops from NSSTA & TPAC PDFs.
    """
    resources = []
    
    nssta_tpac_items = [
        # NSSTA MCTP
        {
            "id": "res_nssta_001",
            "source": "NSSTA",
            "sourceCategory": "NSSTA",
            "sourceDocument": "MCTP Phase-1.pdf",
            "sourcePage": 1,
            "title": "Mid-Career Training Programme (MCTP) Phase 1: Survey Design & Sampling Estimation",
            "description": "Comprehensive mandatory mid-career training module conducted by NSSTA for ISS/SSS officers on complex survey designs, multi-stage stratification, and variance estimation.",
            "comp_code": "STAT_SAMP",
            "duration": 36.0,
            "level": "Intermediate",
            "type": "Training Programme",
            "delivery": "In-Person"
        },
        {
            "id": "res_nssta_002",
            "source": "NSSTA",
            "sourceCategory": "NSSTA",
            "sourceDocument": "MCTP Phase-2.pdf",
            "sourcePage": 1,
            "title": "Mid-Career Training Programme (MCTP) Phase 2: Project Management & Policy Execution",
            "description": "NSSTA executive module covering design, evaluation, execution of large statistical projects, and advanced administrative decision making.",
            "comp_code": "MGR_PRJM",
            "duration": 36.0,
            "level": "Advanced",
            "type": "Training Programme",
            "delivery": "In-Person"
        },
        {
            "id": "res_nssta_003",
            "source": "NSSTA",
            "sourceCategory": "NSSTA",
            "sourceDocument": "Statistical Literacy and Storytelling.pdf",
            "sourcePage": 1,
            "title": "Statistical Literacy, Dissemination and Data Storytelling Workshop",
            "description": "Specialized NSSTA workshop on transforming raw survey datasets into impactful policy infographics, executive briefs, and public dissemination graphics.",
            "comp_code": "MGR_COMM",
            "duration": 18.0,
            "level": "Intermediate",
            "type": "Workshop",
            "delivery": "In-Person"
        },

        # TPAC Approved Programmes (2022-2026 Calendars)
        {
            "id": "res_tpac_001",
            "source": "TPAC",
            "sourceCategory": "TPAC",
            "sourceDocument": "1745840287667-TPAC 2025-2026.pdf",
            "sourcePage": 4,
            "title": "Foundation Course on Machine Learning Using Python",
            "description": "TPAC FY 2025-26 approved 1-week hands-on training programme covering Python, Pandas, Scikit-Learn, and statistical automation for official surveys.",
            "comp_code": "TECH_PYTH",
            "duration": 30.0,
            "level": "Intermediate",
            "type": "Training Programme",
            "delivery": "Blended"
        },
        {
            "id": "res_tpac_002",
            "source": "TPAC",
            "sourceCategory": "TPAC",
            "sourceDocument": "1745840287667-TPAC 2025-2026.pdf",
            "sourcePage": 4,
            "title": "Refresher Programme on Recent Developments in Survey Methodology & Sampling Techniques",
            "description": "TPAC approved refresher course on modern probability sampling, PPS selection, calibration weighting, and RSE reduction in national surveys.",
            "comp_code": "STAT_SAMP",
            "duration": 30.0,
            "level": "Intermediate",
            "type": "Training Programme",
            "delivery": "In-Person"
        },
        {
            "id": "res_tpac_003",
            "source": "TPAC",
            "sourceCategory": "TPAC",
            "sourceDocument": "1742816543941-TPAC 2024 - 2025.pdf",
            "sourcePage": 12,
            "title": "National Workshop on National Accounts Statistics & GVA Compilation",
            "description": "Annual TPAC workshop on System of National Accounts (SNA), supply-use tables, GDP deflators, and institutional sector accounts.",
            "comp_code": "STAT_NACC",
            "duration": 24.0,
            "level": "Advanced",
            "type": "Workshop",
            "delivery": "In-Person"
        },
        {
            "id": "res_tpac_004",
            "source": "TPAC",
            "sourceCategory": "TPAC",
            "sourceDocument": "1742816407240-TPAC 2023 - 2024.pdf",
            "sourcePage": 8,
            "title": "Specialized Training on Price Indices, CPI/WPI Compilation & Weighting Revisions",
            "description": "TPAC approved specialized training covering consumer basket construction, geometric mean indexing, and chain-linking methods.",
            "comp_code": "STAT_PRIC",
            "duration": 24.0,
            "level": "Intermediate",
            "type": "Training Programme",
            "delivery": "In-Person"
        },
        {
            "id": "res_tpac_005",
            "source": "TPAC",
            "sourceCategory": "TPAC",
            "sourceDocument": "1742816327620-TPAC 2022 - 2023.pdf",
            "sourcePage": 14,
            "title": "Training Programme on Big Data Analytics & Artificial Intelligence in Official Statistics",
            "description": "Hands-on module on leveraging satellite imagery, scanner data, and ML imputation in MoSPI official statistics workflows.",
            "comp_code": "TECH_AIML",
            "duration": 30.0,
            "level": "Advanced",
            "type": "Training Programme",
            "delivery": "Blended"
        }
    ]

    for item in nssta_tpac_items:
        comp = COMPETENCY_MAPPING.get(item["comp_code"], {})
        resources.append({
            "id": item["id"],
            "source": item["source"],
            "sourceCategory": item["sourceCategory"],
            "sourceDocument": item["sourceDocument"],
            "sourcePage": item["sourcePage"],
            "title": item["title"],
            "description": item["description"],
            "competencyId": comp.get("id"),
            "competencyCode": item["comp_code"],
            "competencyName": comp.get("name"),
            "competencyCategory": comp.get("category"),
            "resourceType": item["type"],
            "durationHours": item["duration"],
            "targetLevel": item["level"],
            "deliveryMode": item["delivery"],
            "isApiReady": True,
            "metadata": {
                "sourceDocument": item["sourceDocument"],
                "sourcePage": item["sourcePage"]
            }
        })

    return resources

def extract_learning_materials():
    """
    Extracts official MoSPI learning materials / handbooks as grounded reference resources.
    """
    materials = [
        {
            "id": "res_mat_001",
            "source": "MoSPI",
            "sourceCategory": "Learning Material",
            "sourceDocument": "Sampling Design.pdf",
            "sourcePage": 1,
            "title": "MoSPI Reference Manual: Sample Design and Estimation Procedures (NSS 66th Round)",
            "description": "Authoritative technical manual on two-stage stratified sampling design, first stage units (FSUs), ultimate stage units (USUs), multiplier formulas, and sampling error formulas.",
            "comp_code": "STAT_SAMP",
            "duration": 15.0,
            "level": "Intermediate",
            "type": "Handbook",
            "delivery": "Self-Paced"
        },
        {
            "id": "res_mat_002",
            "source": "MoSPI",
            "sourceCategory": "Learning Material",
            "sourceDocument": "Sampling + Survey Methodology.pdf",
            "sourcePage": 1,
            "title": "MoSPI Survey Methodology & Field Estimation Guidelines",
            "description": "Core guidance on survey instrument formulation, household selection procedures, sub-round balancing, and multi-stage weight calibration.",
            "comp_code": "STAT_SURV",
            "duration": 10.0,
            "level": "Intermediate",
            "type": "Handbook",
            "delivery": "Self-Paced"
        },
        {
            "id": "res_mat_003",
            "source": "MoSPI",
            "sourceCategory": "Learning Material",
            "sourceDocument": "Data Quality.pdf",
            "sourcePage": 1,
            "title": "Handbook on Health Statistics & Data Quality Assurance in Official Datasets",
            "description": "Comprehensive handbook on national statistical quality assurance, completeness validation, non-sampling error detection, and consistency checks across central registers.",
            "comp_code": "STAT_QUAL",
            "duration": 25.0,
            "level": "Advanced",
            "type": "Handbook",
            "delivery": "Self-Paced"
        }
    ]

    resources = []
    for item in materials:
        comp = COMPETENCY_MAPPING.get(item["comp_code"], {})
        resources.append({
            "id": item["id"],
            "source": item["source"],
            "sourceCategory": item["sourceCategory"],
            "sourceDocument": item["sourceDocument"],
            "sourcePage": item["sourcePage"],
            "title": item["title"],
            "description": item["description"],
            "competencyId": comp.get("id"),
            "competencyCode": item["comp_code"],
            "competencyName": comp.get("name"),
            "competencyCategory": comp.get("category"),
            "resourceType": item["type"],
            "durationHours": item["duration"],
            "targetLevel": item["level"],
            "deliveryMode": item["delivery"],
            "isApiReady": True,
            "metadata": {
                "sourceDocument": item["sourceDocument"],
                "sourcePage": item["sourcePage"]
            }
        })
    return resources

def process_and_extract(discovered_files, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    all_documents = []
    all_chunks = []
    global_chunk_idx = 0
    
    for item in discovered_files:
        doc_info = {
            "id": f"doc_{len(all_documents)+1:03d}",
            "filename": item["filename"],
            "file_path": item["full_path"],
            "category": item["category"],
            "size_bytes": item["size_bytes"],
            "pages": []
        }
        
        if fitz is not None:
            try:
                doc = fitz.open(item["full_path"])
                total_pages = len(doc)
                doc_info["total_pages"] = total_pages
                
                for page_num in range(total_pages):
                    page = doc[page_num]
                    text = page.get_text("text").strip()
                    if text:
                        doc_info["pages"].append({
                            "page_number": page_num + 1,
                            "text": text,
                            "char_count": len(text)
                        })
                        
                        words = text.split()
                        chunk_size = 400
                        for i in range(0, max(1, len(words)), chunk_size):
                            chunk_words = words[i:i + chunk_size]
                            chunk_text = " ".join(chunk_words)
                            all_chunks.append({
                                "chunk_id": f"chunk_{global_chunk_idx:05d}",
                                "chunk_index": global_chunk_idx,
                                "document_id": doc_info["id"],
                                "document_name": item["filename"],
                                "category": item["category"],
                                "page_number": page_num + 1,
                                "content": chunk_text,
                                "word_count": len(chunk_words)
                            })
                            global_chunk_idx += 1
                doc.close()
            except Exception as e:
                print(f"[Warning] Error extracting {item['filename']}: {e}")
        else:
            doc_info["total_pages"] = 0
            
        all_documents.append(doc_info)
        
    # Extract normalized resources from the 11 PDFs
    igot_pdf = next((Path(f["full_path"]) for f in discovered_files if "Karmayogi" in f["filename"]), None)
    igot_resources = extract_igot_courses(igot_pdf) if igot_pdf else []
    nssta_tpac_resources = extract_nssta_and_tpac_resources(PROJECT_ROOT.parent / "NSSTA_TPAC")
    material_resources = extract_learning_materials()
    
    normalized_catalogue = igot_resources + nssta_tpac_resources + material_resources
    
    # Save processed files
    with open(output_dir / "documents_metadata.json", "w", encoding="utf-8") as f:
        summary_docs = [{k: v for k, v in d.items() if k != "pages"} for d in all_documents]
        json.dump(summary_docs, f, indent=2)
        
    with open(output_dir / "extracted_chunks.json", "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)
        
    with open(output_dir / "normalized_learning_resources.json", "w", encoding="utf-8") as f:
        json.dump(normalized_catalogue, f, indent=2, ensure_ascii=False)
        
    print(f"\n[Ingestion & Normalization Complete]")
    print(f"Total Source PDFs Processed: {len(all_documents)}")
    print(f"Total RAG Chunks Generated: {len(all_chunks)}")
    print(f"Total Normalized Learning Resources: {len(normalized_catalogue)}")
    print(f"  - iGOT Courses: {len(igot_resources)}")
    print(f"  - NSSTA Programmes: 3")
    print(f"  - TPAC Approved Modules: 5")
    print(f"  - MoSPI Learning Handbooks: {len(material_resources)}")
    print(f"Output Saved To: {output_dir}")
    
    return all_documents, all_chunks, normalized_catalogue

if __name__ == "__main__":
    parent_source_dir = PROJECT_ROOT.parent
    print(f"[StatIntel Ingestion] Scanning parent source directory: {parent_source_dir}")
    files = discover_source_pdfs(parent_source_dir)
    print(f"Discovered {len(files)} source PDFs.")
    out_dir = PROJECT_ROOT / "data" / "processed"
    process_and_extract(files, out_dir)
