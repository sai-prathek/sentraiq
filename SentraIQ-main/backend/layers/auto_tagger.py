"""
Auto-Tagging Engine: Heuristic-based control mapping during ingestion
Maps log sources and content to controls using lightweight heuristics
"""
from typing import List, Dict, Any, Optional
import re
from backend.layers.control_library import get_all_controls, Framework


class AutoTagger:
    """
    Heuristic-based auto-tagging engine for evidence
    Maps sources (e.g., Tenable, Nessus) and content to controls
    """
    
    # Source to Control Mapping (heuristic lookup table)
    SOURCE_TO_CONTROL_MAP: Dict[str, List[str]] = {
        # Vulnerability scanning tools
        "tenable": ["SWIFT-2.7", "SOC2-CC7.1"],
        "nessus": ["SWIFT-2.7", "SOC2-CC7.1"],
        "qualys": ["SWIFT-2.7", "SOC2-CC7.1"],
        "rapid7": ["SWIFT-2.7", "SOC2-CC7.1"],
        
        # MFA/Authentication tools
        "duo": ["SWIFT-2.8", "SOC2-CC6.2"],
        "okta": ["SWIFT-2.8", "SOC2-CC6.2"],
        "auth0": ["SWIFT-2.8", "SOC2-CC6.2"],
        "azure ad": ["SWIFT-2.8", "SOC2-CC6.2"],
        
        # SIEM/Monitoring tools
        "splunk": ["SWIFT-3.1", "SOC2-CC7.1"],
        "qradar": ["SWIFT-3.1", "SOC2-CC7.1"],
        "arcsight": ["SWIFT-3.1", "SOC2-CC7.1"],
        "logrhythm": ["SWIFT-3.1", "SOC2-CC7.1"],
        
        # Firewall/Network
        "firewall": ["SWIFT-1.1", "SWIFT-1.2"],
        "palo alto": ["SWIFT-1.1", "SWIFT-1.2"],
        "fortinet": ["SWIFT-1.1", "SWIFT-1.2"],
        "cisco": ["SWIFT-1.1", "SWIFT-1.2"],
        
        # SWIFT-specific
        "swift": ["SWIFT-2.8", "SWIFT-3.1"],
        "alliance": ["SWIFT-2.8", "SWIFT-3.1"],
    }
    
    # Content pattern to control mapping
    CONTENT_PATTERNS: Dict[str, List[str]] = {
        r"vulnerability.*scan": ["SWIFT-2.7"],
        r"penetration.*test": ["SWIFT-2.7"],
        r"mfa.*challenge": ["SWIFT-2.8", "SOC2-CC6.2"],
        r"two.*factor": ["SWIFT-2.8", "SOC2-CC6.2"],
        r"authentication.*success": ["SWIFT-2.8", "SOC2-CC6.2"],
        r"audit.*log": ["SWIFT-3.1", "SOC2-CC7.1"],
        r"access.*denied": ["SWIFT-2.1", "SOC2-CC6.1"],
        r"password.*policy": ["SWIFT-2.1", "SOC2-CC6.1"],
        r"network.*segment": ["SWIFT-1.1", "SWIFT-1.2"],
        r"firewall.*rule": ["SWIFT-1.1", "SWIFT-1.2"],
    }
    
    @staticmethod
    def auto_tag_from_source(source: str, filename: str = "") -> List[Dict[str, Any]]:
        """
        Auto-tag based on source system name
        Returns list of control mappings with reasoning
        """
        source_lower = source.lower()
        filename_lower = filename.lower() if filename else ""
        combined = f"{source_lower} {filename_lower}"
        
        matched_controls = []
        all_controls = get_all_controls()
        
        # Check source mapping
        for source_key, control_ids in AutoTagger.SOURCE_TO_CONTROL_MAP.items():
            if source_key in combined:
                for control_id in control_ids:
                    if control_id in all_controls:
                        control = all_controls[control_id]
                        matched_controls.append({
                            "control_id": control_id,
                            "control_name": control["name"],
                            "reasoning": f"Source '{source}' matches known control source pattern '{source_key}'",
                            "confidence": 0.8,  # High confidence for source-based matching
                            "mapping_method": "source_heuristic"
                        })
        
        # Remove duplicates
        seen = set()
        unique_controls = []
        for ctrl in matched_controls:
            if ctrl["control_id"] not in seen:
                seen.add(ctrl["control_id"])
                unique_controls.append(ctrl)
        
        return unique_controls
    
    @staticmethod
    def auto_tag_from_content(content: str, source: str = "") -> List[Dict[str, Any]]:
        """
        Auto-tag based on content patterns
        Returns list of control mappings with reasoning
        """
        content_lower = content.lower()[:5000]  # Limit content size for performance
        matched_controls = []
        all_controls = get_all_controls()
        
        # Check content patterns
        for pattern, control_ids in AutoTagger.CONTENT_PATTERNS.items():
            if re.search(pattern, content_lower, re.IGNORECASE):
                for control_id in control_ids:
                    if control_id in all_controls:
                        control = all_controls[control_id]
                        matched_controls.append({
                            "control_id": control_id,
                            "control_name": control["name"],
                            "reasoning": f"Content matches pattern '{pattern}' indicating {control['name']}",
                            "confidence": 0.7,  # Medium confidence for content-based matching
                            "mapping_method": "content_heuristic"
                        })
        
        # Also check control keywords
        for control_id, control in all_controls.items():
            keywords = control.get("keywords", [])
            matches = sum(1 for kw in keywords if kw.lower() in content_lower)
            if matches >= 2:  # At least 2 keyword matches
                matched_controls.append({
                    "control_id": control_id,
                    "control_name": control["name"],
                    "reasoning": f"Content contains {matches} keywords matching {control['name']}: {', '.join([kw for kw in keywords if kw.lower() in content_lower][:3])}",
                    "confidence": min(0.6 + (matches * 0.05), 0.9),
                    "mapping_method": "keyword_match"
                })
        
        # Remove duplicates
        seen = set()
        unique_controls = []
        for ctrl in matched_controls:
            if ctrl["control_id"] not in seen:
                seen.add(ctrl["control_id"])
                unique_controls.append(ctrl)
        
        return unique_controls
    
    @staticmethod
    def auto_tag(source: str, filename: str = "", content: str = "") -> List[Dict[str, Any]]:
        """
        Combined auto-tagging from source and content
        Returns deduplicated list of control mappings
        """
        tags = []
        
        # Tag from source
        source_tags = AutoTagger.auto_tag_from_source(source, filename)
        tags.extend(source_tags)
        
        # Tag from content if available
        if content:
            content_tags = AutoTagger.auto_tag_from_content(content, source)
            tags.extend(content_tags)
        
        # Deduplicate and merge
        control_map = {}
        for tag in tags:
            cid = tag["control_id"]
            if cid not in control_map:
                control_map[cid] = tag
            else:
                # Merge reasoning and take higher confidence
                existing = control_map[cid]
                existing["reasoning"] = f"{existing['reasoning']}; {tag['reasoning']}"
                existing["confidence"] = max(existing["confidence"], tag["confidence"])
                existing["mapping_method"] = f"{existing['mapping_method']}+{tag['mapping_method']}"
        
        return list(control_map.values())
