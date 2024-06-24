import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faStar } from '@fortawesome/free-solid-svg-icons';
import { faMap as faRegularMap } from '@fortawesome/free-regular-svg-icons';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';


const getNodeIcon = (node, expanded) => {
    if (node.level === 0) {
      return (
        <FontAwesomeIcon
          icon={expanded ? faStar : faLocationDot}
          style={{ color: "#fd6a08" }}
        />
      );
    } else if (node.children && node.children.length > 0) {
      return (
        <FontAwesomeIcon
          icon={expanded ? faLocationDot : faLocationDot}
          style={{ color: "#fd6a08" }}
        />
      );
    } else {
      return (
        <FontAwesomeIcon
          icon={faRegularMap}
          style={{ color: "#00ad1d" }}
        />
      );
    }
  };

  
  const MyComponent = ({ data }) => {
    const [checked, setChecked] = useState([]);
    const [expanded, setExpanded] = useState([]);
  
    const extractNames = (data) => {
      // Assuming you have a function to extract names from data
      return data.map((item, index) => ({
        label: item.name,
        value: item.id,
        children: item.children ? extractNames(item.children) : null,
        level: item.level || 0,  // Add a level property to each node
      }));
    };
  
    return (
      <CheckboxTree
        nodes={extractNames(data)}
        checked={checked}
        expanded={expanded}
        onCheck={(newChecked) => setChecked(newChecked)}
        onExpand={setExpanded}
        showNodeIcon={({ node }) => getNodeIcon(node, expanded.includes(node.value))}
      />
    );
  };
  
  export default MyComponent;
  