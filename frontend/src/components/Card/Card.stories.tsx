import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'gradient'],
    },
    clickable: {
      control: 'boolean',
    },
    padding: {
      control: 'radio',
      options: ['none', 'small', 'medium', 'large'],
    },
    shadow: {
      control: 'boolean',
    },
    onClick: { action: 'onClick' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample content components
const EventContent = () => (
  <div style={{ width: '300px' }}>
    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1C5B46' }}>
      Friday Prayer
    </h3>
    <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#87928F' }}>
      Join us for congregational Friday prayers
    </p>
    <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
      <span>📅 Every Friday</span>
      <span>🕐 1:00 PM</span>
    </div>
  </div>
);

const ProfileContent = () => (
  <div style={{ width: '300px', textAlign: 'center' }}>
    <div style={{ 
      width: '80px', 
      height: '80px', 
      borderRadius: '50%', 
      backgroundColor: '#E5ECEA',
      margin: '0 auto 16px'
    }} />
    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Ahmad Ibrahim</h3>
    <p style={{ margin: '0', fontSize: '14px', color: '#87928F' }}>
      Member since 2024
    </p>
  </div>
);

export const Default: Story = {
  args: {
    variant: 'default',
    children: <EventContent />,
  },
};

export const Gradient: Story = {
  args: {
    variant: 'gradient',
    children: (
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px 0' }}>2,450</h2>
        <p style={{ margin: 0 }}>Total Points</p>
      </div>
    ),
  },
};

export const Clickable: Story = {
  args: {
    variant: 'default',
    clickable: true,
    children: <EventContent />,
  },
};

export const NoShadow: Story = {
  args: {
    variant: 'default',
    shadow: false,
    children: <ProfileContent />,
  },
};

export const SmallPadding: Story = {
  args: {
    variant: 'default',
    padding: 'small',
    children: <p>Card with small padding</p>,
  },
};

export const LargePadding: Story = {
  args: {
    variant: 'default',
    padding: 'large',
    children: <ProfileContent />,
  },
};

export const NoPadding: Story = {
  args: {
    variant: 'default',
    padding: 'none',
    children: (
      <div>
        <img 
          src="https://via.placeholder.com/300x150/1C5B46/FFFFFF?text=Event+Image" 
          alt="Event"
          style={{ width: '100%', display: 'block' }}
        />
        <div style={{ padding: '16px' }}>
          <h3 style={{ margin: 0 }}>Community Event</h3>
        </div>
      </div>
    ),
  },
};