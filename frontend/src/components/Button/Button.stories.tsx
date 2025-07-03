import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'secondary'],
    },
    color: {
      control: 'radio',
      options: ['green'],
    },
    size: {
      control: 'radio',
      options: ['normal', 'small'],
    },
    fullWidth: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    color: 'green',
    size: 'normal',
    children: 'Login',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    color: 'green',
    size: 'normal',
    children: 'Manage Points',
  },
};

export const Small: Story = {
  args: {
    variant: 'secondary',
    color: 'green',
    size: 'small',
    children: 'View All',
  },
};

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    color: 'green',
    size: 'normal',
    fullWidth: true,
    children: 'Create Account',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    color: 'green',
    size: 'normal',
    loading: true,
    children: 'Submitting...',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    color: 'green',
    size: 'normal',
    disabled: true,
    children: 'Disabled Button',
  },
};