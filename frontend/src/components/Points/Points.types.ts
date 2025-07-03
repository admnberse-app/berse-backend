export interface PointsProps {
  /** Current points value */
  points: number;
  /** Label for points */
  label?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show full card view */
  showCard?: boolean;
  /** Whether to show link to rewards */
  showRewardsLink?: boolean;
  /** Click handler for rewards link */
  onRewardsClick?: () => void;
  /** Additional content for card view */
  additionalContent?: React.ReactNode;
}