import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #F5F3EF;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #333;
  font-size: 16px;
  cursor: pointer;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #2fce98;
`;

const PostButton = styled.button<{ disabled?: boolean }>`
  background: ${({ disabled }) => disabled ? '#CCC' : '#2fce98'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
`;

const Content = styled.div`
  flex: 1;
  padding: 0 20px 100px 20px;
  overflow-y: auto;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #F8F9FA;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    background: white;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #F8F9FA;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    background: white;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #F8F9FA;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    background: white;
  }
`;

const TagsSection = styled.div`
  margin-top: 16px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const Tag = styled.div<{ type: 'event' | 'profile' | 'general' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${({ type }) => 
    type === 'event' ? '#FFF3E0' : 
    type === 'profile' ? '#E8F5E8' : '#F3E5F5'
  };
  color: ${({ type }) => 
    type === 'event' ? '#F57C00' : 
    type === 'profile' ? '#2E7D32' : '#7B1FA2'
  };
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 10px;
  padding: 0;
  margin-left: 4px;
`;

const TagInput = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const TagTypeSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 12px;
  background: white;
`;

const TagTextInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 12px;
`;

const AddTagButton = styled.button`
  padding: 8px 12px;
  background: #E8F4F0;
  color: #2fce98;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const SuggestedTags = styled.div`
  margin-top: 8px;
`;

const SuggestedTagsTitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

const SuggestedTag = styled.button`
  padding: 4px 8px;
  margin: 2px 4px 2px 0;
  background: #F8F9FA;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  font-size: 11px;
  color: #666;
  cursor: pointer;
  
  &:hover {
    background: #E8F4F0;
    border-color: #2fce98;
    color: #2fce98;
  }
`;

const CharacterCount = styled.div`
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 4px;
`;

const GuidelinesSection = styled.div`
  background: #FFF8E1;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const GuidelinesTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #F57C00;
`;

const GuidelinesList = styled.ul`
  margin: 0;
  padding-left: 16px;
  color: #F57C00;
  font-size: 12px;
  
  li {
    margin-bottom: 4px;
  }
`;

const PreviewSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const PreviewCard = styled.div`
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 16px;
  background: #F8F9FA;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const PreviewAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2fce98;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

const PreviewMeta = styled.div`
  flex: 1;
`;

const PreviewAuthor = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const PreviewTime = styled.div`
  font-size: 12px;
  color: #666;
`;

const PreviewStatus = styled.div`
  padding: 4px 8px;
  background-color: #FFF3E0;
  color: #F57C00;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
`;

const PreviewCategory = styled.div`
  display: inline-block;
  padding: 4px 8px;
  background-color: #E8F4F0;
  color: #2fce98;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const PreviewTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const PreviewContent = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 12px 0;
`;

const SubmissionInfo = styled.div`
  background: #E3F2FD;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const SubmissionTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1976D2;
`;

const SubmissionText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1976D2;
  line-height: 1.4;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const PreviewButton = styled.button`
  flex: 1;
  background: #F8F9FA;
  color: #333;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const SubmitButton = styled.button<{ disabled?: boolean }>`
  flex: 1;
  background-color: ${({ disabled }) => disabled ? '#CCC' : '#2fce98'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: ${({ disabled }) => disabled ? '#CCC' : '#1F4A3A'};
  }
`;

interface PostTag {
  text: string;
  type: 'event' | 'profile' | 'general';
}

export const CreateForumPostScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General'
  });
  
  const [tags, setTags] = useState<PostTag[]>([]);
  const [newTagText, setNewTagText] = useState('');
  const [newTagType, setNewTagType] = useState<'event' | 'profile' | 'general'>('general');
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    'General',
    'Questions',
    'Recommendations', 
    'Events',
    'Introductions',
    'Help & Support'
  ];

  const suggestedTags = {
    event: ['Monday Meetups', 'BerseMinton', 'Weekend Trip', 'Coffee Meetup'],
    profile: ['@khalid_m', '@sukan_squad', '@admin'],
    general: ['networking', 'points', 'tips', 'newbie', 'help']
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (!newTagText.trim()) return;
    
    const newTag: PostTag = {
      text: newTagText.trim(),
      type: newTagType
    };
    
    setTags(prev => [...prev, newTag]);
    setNewTagText('');
  };

  const removeTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const addSuggestedTag = (text: string, type: 'event' | 'profile' | 'general') => {
    const newTag: PostTag = { text, type };
    setTags(prev => [...prev, newTag]);
  };

  const handleSubmit = async () => {
    try {
      const newPost = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: tags,
        author: user?.fullName || 'Current User',
        authorInitials: user?.fullName?.split(' ').map(n => n[0]).join('') || 'CU',
        status: 'pending',
        likes: 0,
        replies: [],
        replyCount: 0,
        isRecommended: false,
        createdAt: new Date().toISOString()
      };

      console.log('Submitting post for approval:', newPost);
      
      // Here you would make an API call to submit the post
      // await forumService.createPost(newPost);

      // Show submission success message
      alert('Your post has been submitted for admin approval! You\'ll receive a notification once it\'s reviewed.');
      
      // Navigate back to forum
      navigate('/forum');
    } catch (error) {
      console.error('Failed to submit post:', error);
      alert('Failed to submit post. Please try again.');
    }
  };

  const isFormValid = formData.title.trim() && formData.content.trim();

  const renderPreview = () => (
    <PreviewCard>
      <PreviewHeader>
        <PreviewAvatar>
          {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'CU'}
        </PreviewAvatar>
        <PreviewMeta>
          <PreviewAuthor>{user?.fullName || 'Current User'}</PreviewAuthor>
          <PreviewTime>Just now</PreviewTime>
        </PreviewMeta>
        <PreviewStatus>⏳ Pending</PreviewStatus>
      </PreviewHeader>
      
      <PreviewCategory>{formData.category}</PreviewCategory>
      <PreviewTitle>{formData.title || 'Your post title...'}</PreviewTitle>
      <PreviewContent>{formData.content || 'Your post content...'}</PreviewContent>
      
      {tags.length > 0 && (
        <TagsContainer>
          {tags.map((tag, index) => (
            <Tag key={index} type={tag.type}>
              {tag.text}
            </Tag>
          ))}
        </TagsContainer>
      )}
    </PreviewCard>
  );

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          ← Cancel
        </BackButton>
        <HeaderTitle>Create Post</HeaderTitle>
        <PostButton disabled={!isFormValid} onClick={handleSubmit}>
          Submit
        </PostButton>
      </Header>

      <Content>
        <GuidelinesSection>
          <GuidelinesTitle>📋 Community Guidelines</GuidelinesTitle>
          <GuidelinesList>
            <li>Keep discussions respectful and constructive</li>
            <li>Use relevant tags to help others find your post</li>
            <li>Posts are reviewed by admins before going live</li>
            <li>No spam, promotional content, or inappropriate material</li>
            <li>Tag events and profiles to build connections</li>
          </GuidelinesList>
        </GuidelinesSection>

        <FormSection>
          <SectionTitle>✍️ Your Post</SectionTitle>
          
          <FormGroup>
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What would you like to discuss?"
              maxLength={100}
            />
            <CharacterCount>{formData.title.length}/100</CharacterCount>
          </FormGroup>

          <FormGroup>
            <Label>Category *</Label>
            <Select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Content *</Label>
            <TextArea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              maxLength={1000}
            />
            <CharacterCount>{formData.content.length}/1000</CharacterCount>
          </FormGroup>

          <TagsSection>
            <Label>Tags (Optional)</Label>
            
            {tags.length > 0 && (
              <TagsContainer>
                {tags.map((tag, index) => (
                  <Tag key={index} type={tag.type}>
                    {tag.text}
                    <RemoveTagButton onClick={() => removeTag(index)}>
                      ×
                    </RemoveTagButton>
                  </Tag>
                ))}
              </TagsContainer>
            )}

            <TagInput>
              <TagTypeSelect
                value={newTagType}
                onChange={(e) => setNewTagType(e.target.value as 'event' | 'profile' | 'general')}
              >
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="profile">Profile</option>
              </TagTypeSelect>
              <TagTextInput
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                placeholder="Add a tag..."
                maxLength={30}
              />
              <AddTagButton onClick={addTag} disabled={!newTagText.trim()}>
                Add
              </AddTagButton>
            </TagInput>

            <SuggestedTags>
              <SuggestedTagsTitle>Suggested tags:</SuggestedTagsTitle>
              {Object.entries(suggestedTags).map(([type, tagList]) =>
                tagList.map((suggestedTag) => (
                  <SuggestedTag
                    key={`${type}-${suggestedTag}`}
                    onClick={() => addSuggestedTag(suggestedTag, type as 'event' | 'profile' | 'general')}
                  >
                    {suggestedTag}
                  </SuggestedTag>
                ))
              )}
            </SuggestedTags>
          </TagsSection>
        </FormSection>

        <SubmissionInfo>
          <SubmissionTitle>📝 What happens next?</SubmissionTitle>
          <SubmissionText>
            Your post will be reviewed by our admin team within 24 hours. You'll receive a notification once it's approved and goes live in the community forum. This helps us maintain a positive and spam-free environment for everyone!
          </SubmissionText>
        </SubmissionInfo>

        {showPreview && (
          <PreviewSection>
            <SectionTitle>👁️ Preview</SectionTitle>
            {renderPreview()}
          </PreviewSection>
        )}

        <ActionButtons>
          <PreviewButton onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? '📝 Edit' : '👁️ Preview'}
          </PreviewButton>
          <SubmitButton disabled={!isFormValid} onClick={handleSubmit}>
            📤 Submit for Review
          </SubmitButton>
        </ActionButtons>
      </Content>
      
      <MainNav 
        activeTab="forum"
        onTabPress={(tab) => {
          switch (tab) {
            case 'home':
              navigate('/dashboard');
              break;
            case 'connect':
              navigate('/connect');
              break;
            case 'match':
              navigate('/match');
              break;
            case 'forum':
              navigate('/forum');
              break;
          }
        }}
      />
    </Container>
  );
};