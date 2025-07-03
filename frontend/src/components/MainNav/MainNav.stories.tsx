import type { Meta, StoryObj } from '@storybook/react';
import { MainNav } from './MainNav';

const meta: Meta<typeof MainNav> = {
  title: 'Components/MainNav',
  component: MainNav,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    activeTab: {
      control: 'radio',
      options: ['Home', 'BerseConnect', 'BerseMatch', 'Profile'],
    },
    onTabClick: { action: 'onTabClick' },
  },
  decorators: [
    (Story) => (
      <div style={{ 
        width: '393px', 
        height: '103px',
        position: 'relative' 
      }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeActive: Story = {
  args: {
    activeTab: 'Home',
  },
};

export const BerseConnectActive: Story = {
  args: {
    activeTab: 'BerseConnect',
  },
};

export const BerseMatchActive: Story = {
  args: {
    activeTab: 'BerseMatch',
  },
};

export const ProfileActive: Story = {
  args: {
    activeTab: 'Profile',
  },
};