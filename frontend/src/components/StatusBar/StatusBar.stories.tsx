import type { Meta, StoryObj } from '@storybook/react';
import { StatusBar } from './StatusBar';

const meta: Meta<typeof StatusBar> = {
  title: 'Components/StatusBar',
  component: StatusBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    time: {
      control: 'text',
    },
    darkMode: {
      control: 'boolean',
    },
    showNotch: {
      control: 'boolean',
    },
    showBackground: {
      control: 'boolean',
    },
    iPhoneModel: {
      control: 'radio',
      options: ['16', '15', '14'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ 
        width: '393px', 
        height: '100px', 
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

export const Default: Story = {
  args: {
    time: '3:14',
    darkMode: false,
    showNotch: false,
    showBackground: true,
    iPhoneModel: '16',
  },
};

export const DarkMode: Story = {
  args: {
    time: '9:41',
    darkMode: true,
    showNotch: false,
    showBackground: true,
    iPhoneModel: '16',
  },
};

export const NoBackground: Story = {
  args: {
    time: '12:00',
    darkMode: false,
    showNotch: false,
    showBackground: false,
    iPhoneModel: '16',
  },
};

export const DifferentTime: Story = {
  args: {
    time: '10:30 PM',
    darkMode: false,
    showNotch: false,
    showBackground: true,
    iPhoneModel: '16',
  },
};