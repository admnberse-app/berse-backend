import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'radio',
      options: ['Home', 'BerseConnect', 'BerseMatch', 'Profile'],
    },
    showBackButton: {
      control: 'boolean',
    },
    onBackClick: { action: 'onBackClick' },
    onNotificationClick: { action: 'onNotificationClick' },
    onMenuClick: { action: 'onMenuClick' },
  },
  decorators: [
    (Story) => (
      <div style={{ 
        width: '393px', 
        backgroundColor: '#F9F3E3',
        position: 'relative' 
      }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  args: {
    state: 'Home',
    showBackButton: false,
  },
};

export const BerseConnect: Story = {
  args: {
    state: 'BerseConnect',
    showBackButton: false,
  },
};

export const BerseMatch: Story = {
  args: {
    state: 'BerseMatch',
    showBackButton: false,
  },
};

export const Profile: Story = {
  args: {
    state: 'Profile',
    showBackButton: false,
  },
};

export const WithBackButton: Story = {
  args: {
    state: 'BerseConnect',
    showBackButton: true,
  },
};