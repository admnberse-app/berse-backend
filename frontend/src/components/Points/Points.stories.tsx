import type { Meta, StoryObj } from '@storybook/react';
import { Points } from './Points';

const meta: Meta<typeof Points> = {
  title: 'Components/Points',
  component: Points,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    points: {
      control: 'number',
    },
    label: {
      control: 'text',
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
    },
    showCard: {
      control: 'boolean',
    },
    showRewardsLink: {
      control: 'boolean',
    },
    onRewardsClick: { action: 'onRewardsClick' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    points: 1250,
    label: 'Points',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    points: 500,
    label: 'Reward Points',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    points: 10000,
    label: 'Total Points',
    size: 'large',
  },
};

export const WithCard: Story = {
  args: {
    points: 2450,
    label: 'Your Points',
    size: 'large',
    showCard: true,
  },
};

export const WithRewardsLink: Story = {
  args: {
    points: 3200,
    label: 'Points Balance',
    size: 'medium',
    showCard: true,
    showRewardsLink: true,
  },
};

const BadgeContent = () => (
  <div style={{ 
    display: 'flex', 
    gap: '12px', 
    justifyContent: 'center',
    marginTop: '16px' 
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        margin: '0 auto 4px'
      }} />
      <span style={{ fontSize: '12px' }}>Gold</span>
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        margin: '0 auto 4px'
      }} />
      <span style={{ fontSize: '12px' }}>Silver</span>
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        margin: '0 auto 4px'
      }} />
      <span style={{ fontSize: '12px' }}>Bronze</span>
    </div>
  </div>
);

export const WithAdditionalContent: Story = {
  args: {
    points: 5000,
    label: 'Achievement Points',
    size: 'large',
    showCard: true,
    showRewardsLink: true,
    additionalContent: <BadgeContent />,
  },
};

export const LargeNumber: Story = {
  args: {
    points: 1234567,
    label: 'Lifetime Points',
    size: 'large',
    showCard: true,
  },
};