import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import { IconButton, Slider, Typography, Box, Chip } from '@mui/material';
import { ZoomIn, ZoomOut, Refresh, Fullscreen } from '@mui/icons-material';

interface NetworkNode {
  id: string;
  name: string;
  avatar: string;
  connectionType: 'direct' | 'mutual' | 'suggested';
  strength: number;
  x?: number;
  y?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  strength: number;
  type: 'friend' | 'mutual' | 'potential';
}

interface NetworkVisualizationProps {
  userId: string;
  onNodeClick?: (node: NetworkNode) => void;
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  overflow: hidden;
`;

const Controls = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10;
  backdrop-filter: blur(10px);
`;

const SVGContainer = styled.svg`
  width: 100%;
  height: 100%;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const StatsPanel = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
  max-width: 300px;
`;

const Legend = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
`;

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  userId,
  onNodeClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [networkStats, setNetworkStats] = useState({
    totalConnections: 0,
    directConnections: 0,
    mutualConnections: 0,
    networkReach: 0,
  });

  // Mock data - replace with API call
  const mockNetworkData = {
    nodes: [
      { id: userId, name: 'You', avatar: '/avatars/user.jpg', connectionType: 'direct' as const, strength: 1 },
      { id: '2', name: 'Ahmad', avatar: '/avatars/1.jpg', connectionType: 'direct' as const, strength: 0.9 },
      { id: '3', name: 'Fatima', avatar: '/avatars/2.jpg', connectionType: 'direct' as const, strength: 0.8 },
      { id: '4', name: 'Omar', avatar: '/avatars/3.jpg', connectionType: 'mutual' as const, strength: 0.6 },
      { id: '5', name: 'Aisha', avatar: '/avatars/4.jpg', connectionType: 'mutual' as const, strength: 0.5 },
      { id: '6', name: 'Hassan', avatar: '/avatars/5.jpg', connectionType: 'suggested' as const, strength: 0.3 },
      { id: '7', name: 'Zainab', avatar: '/avatars/6.jpg', connectionType: 'suggested' as const, strength: 0.3 },
      { id: '8', name: 'Ibrahim', avatar: '/avatars/7.jpg', connectionType: 'direct' as const, strength: 0.7 },
      { id: '9', name: 'Mariam', avatar: '/avatars/8.jpg', connectionType: 'mutual' as const, strength: 0.4 },
      { id: '10', name: 'Yusuf', avatar: '/avatars/9.jpg', connectionType: 'suggested' as const, strength: 0.2 },
    ],
    links: [
      { source: userId, target: '2', strength: 0.9, type: 'friend' as const },
      { source: userId, target: '3', strength: 0.8, type: 'friend' as const },
      { source: userId, target: '8', strength: 0.7, type: 'friend' as const },
      { source: '2', target: '4', strength: 0.6, type: 'mutual' as const },
      { source: '3', target: '5', strength: 0.5, type: 'mutual' as const },
      { source: '4', target: '6', strength: 0.3, type: 'potential' as const },
      { source: '5', target: '7', strength: 0.3, type: 'potential' as const },
      { source: '8', target: '9', strength: 0.4, type: 'mutual' as const },
      { source: '9', target: '10', strength: 0.2, type: 'potential' as const },
      { source: '2', target: '3', strength: 0.5, type: 'mutual' as const },
      { source: '4', target: '5', strength: 0.4, type: 'mutual' as const },
    ],
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom as any);

    const g = svg.append('g');

    // Create force simulation
    const simulation = d3.forceSimulation(mockNetworkData.nodes as any)
      .force('link', d3.forceLink(mockNetworkData.links)
        .id((d: any) => d.id)
        .distance((d: any) => 100 / d.strength))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create gradient definitions
    const defs = svg.append('defs');

    // Add gradients for links
    const linkGradient = defs.append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    linkGradient.append('stop')
      .attr('offset', '0%')
      .style('stop-color', '#667eea')
      .style('stop-opacity', 0.6);

    linkGradient.append('stop')
      .attr('offset', '100%')
      .style('stop-color', '#764ba2')
      .style('stop-opacity', 0.6);

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(mockNetworkData.links)
      .enter().append('line')
      .attr('stroke', (d) => {
        switch (d.type) {
          case 'friend': return '#4CAF50';
          case 'mutual': return '#2196F3';
          case 'potential': return '#FFC107';
          default: return '#999';
        }
      })
      .attr('stroke-opacity', (d) => d.strength)
      .attr('stroke-width', (d) => Math.sqrt(d.strength * 10));

    // Create node groups
    const node = g.append('g')
      .selectAll('g')
      .data(mockNetworkData.nodes)
      .enter().append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Add circles for nodes
    node.append('circle')
      .attr('r', (d) => 20 + d.strength * 10)
      .attr('fill', (d) => {
        switch (d.connectionType) {
          case 'direct': return '#4CAF50';
          case 'mutual': return '#2196F3';
          case 'suggested': return '#FFC107';
          default: return '#999';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('click', (event, d) => {
        setSelectedNode(d as NetworkNode);
        if (onNodeClick) {
          onNodeClick(d as NetworkNode);
        }
      });

    // Add labels
    node.append('text')
      .text((d) => d.name)
      .attr('x', 0)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    // Animation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Calculate network stats
    const directConnections = mockNetworkData.nodes.filter(n => n.connectionType === 'direct').length - 1;
    const mutualConnections = mockNetworkData.nodes.filter(n => n.connectionType === 'mutual').length;
    const totalConnections = mockNetworkData.nodes.length - 1;
    const networkReach = mockNetworkData.nodes.reduce((acc, node) => acc + node.strength, 0);

    setNetworkStats({
      totalConnections,
      directConnections,
      mutualConnections,
      networkReach: Math.round(networkReach * 100),
    });

    return () => {
      simulation.stop();
    };
  }, [userId, onNodeClick]);

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(d3.zoom().scaleTo as any, zoomLevel * 1.2);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(d3.zoom().scaleTo as any, zoomLevel * 0.8);
  };

  const handleReset = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(d3.zoom().scaleTo as any, 1);
  };

  return (
    <Container>
      <Legend>
        <Typography variant="subtitle2" gutterBottom>
          Connection Types
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          <Chip
            size="small"
            label="Direct Friends"
            style={{ backgroundColor: '#4CAF50', color: 'white' }}
          />
          <Chip
            size="small"
            label="Mutual Connections"
            style={{ backgroundColor: '#2196F3', color: 'white' }}
          />
          <Chip
            size="small"
            label="Suggested Friends"
            style={{ backgroundColor: '#FFC107', color: 'white' }}
          />
        </Box>
      </Legend>

      <Controls>
        <IconButton onClick={handleZoomIn} size="small">
          <ZoomIn />
        </IconButton>
        <IconButton onClick={handleZoomOut} size="small">
          <ZoomOut />
        </IconButton>
        <IconButton onClick={handleReset} size="small">
          <Refresh />
        </IconButton>
        <IconButton size="small">
          <Fullscreen />
        </IconButton>
      </Controls>

      <SVGContainer ref={svgRef} />

      <StatsPanel>
        <Typography variant="h6" gutterBottom>
          Network Stats
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">Total Connections:</Typography>
            <Typography variant="body2" fontWeight="bold">
              {networkStats.totalConnections}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">Direct Friends:</Typography>
            <Typography variant="body2" fontWeight="bold" color="success.main">
              {networkStats.directConnections}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">Mutual Connections:</Typography>
            <Typography variant="body2" fontWeight="bold" color="primary">
              {networkStats.mutualConnections}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">Network Reach:</Typography>
            <Typography variant="body2" fontWeight="bold">
              {networkStats.networkReach}%
            </Typography>
          </Box>
        </Box>
        {selectedNode && (
          <Box mt={2} p={1} bgcolor="grey.100" borderRadius={1}>
            <Typography variant="subtitle2">Selected: {selectedNode.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Connection: {selectedNode.connectionType}
            </Typography>
          </Box>
        )}
      </StatsPanel>
    </Container>
  );
};

export default NetworkVisualization;