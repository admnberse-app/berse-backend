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
      options: ['home', 'connect', 'match', 'forum'],
    },
    onTabPress: { action: 'onTabPress' },
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
    activeTab: 'home',
    onTabPress: (tab) => console.log('Tab pressed:', tab),
  },
};

export const ConnectActive: Story = {
  args: {
    activeTab: 'connect',
    onTabPress: (tab) => console.log('Tab pressed:', tab),
  },
};

export const MatchActive: Story = {
  args: {
    activeTab: 'match',
    onTabPress: (tab) => console.log('Tab pressed:', tab),
  },
};

export const ForumActive: Story = {
  args: {
    activeTab: 'forum',
    onTabPress: (tab) => console.log('Tab pressed:', tab),
  },
};