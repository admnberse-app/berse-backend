import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const Modal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  color: white;
  padding: 20px;
  border-radius: 20px 20px 0 0;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Body = styled.div`
  padding: 20px;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
`;

const Step = styled.div<{ $active: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${({ $active }) => $active ? '#2fce98' : '#e0e0e0'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const StepContent = styled.div`
  min-height: 300px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(47, 206, 152, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(47, 206, 152, 0.1);
  }
`;

const QRSection = styled.div`
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const QRCode = styled.div`
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
  background: white;
  border: 2px solid #2fce98;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
`;

const BankInfo = styled.div`
  background: white;
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
`;

const BankDetail = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-size: 12px;
  color: #666;
`;

const DetailValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #333;
`;

const CopyButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const FileUpload = styled.div`
  border: 2px dashed #2fce98;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f9f6;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const UploadText = styled.p`
  font-size: 13px;
  color: #666;
`;

const UploadedFile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f0f9f6;
  border-radius: 8px;
  margin-top: 12px;
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #333;
`;

const FileSize = styled.div`
  font-size: 11px;
  color: #666;
`;

const RemoveButton = styled.button`
  background: #ff4444;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background: #cc0000;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
`;

const PrimaryButton = styled(Button)`
  background: #2fce98;
  color: white;
  
  &:hover {
    background: #1F4A3A;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e5e5e5;
  
  &:hover {
    background: #e5e5e5;
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const SuccessIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const SuccessTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
  color: #2fce98;
  margin-bottom: 8px;
`;

const SuccessText = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const RegistrationNumber = styled.div`
  background: #f0f9f6;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 18px;
  font-weight: bold;
  color: #2fce98;
  letter-spacing: 2px;
`;

interface BerseMintonPaymentProps {
  event: {
    id: string;
    title: string;
    location: string;
    date: string;
    fee: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const BerseMintonPayment: React.FC<BerseMintonPaymentProps> = ({ event, isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [registrationId, setRegistrationId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = () => {
    // Generate registration ID
    const regId = `BM${Date.now().toString().slice(-6)}`;
    setRegistrationId(regId);

    // Store registration data
    const registration = {
      id: regId,
      eventId: event.id,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      sessions: '1',
      amount: 15,
      receiptFileName: uploadedFile?.name,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Get existing registrations
    const existingRegs = JSON.parse(localStorage.getItem('berseMintonRegistrations') || '[]');
    existingRegs.push(registration);
    localStorage.setItem('berseMintonRegistrations', JSON.stringify(existingRegs));

    // Move to success step
    setStep(4);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleReset = () => {
    setStep(1);
    setFormData({
      name: '',
      phone: '',
      email: ''
    });
    setUploadedFile(null);
    setRegistrationId('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal $show={isOpen}>
      <ModalContent>
        <Header>
          <CloseButton onClick={handleClose}>×</CloseButton>
          <Title>🏸 BerseMinton Registration</Title>
          <Subtitle>{event.title}</Subtitle>
        </Header>

        <Body>
          <StepIndicator>
            <Step $active={step >= 1}>1</Step>
            <Step $active={step >= 2}>2</Step>
            <Step $active={step >= 3}>3</Step>
            <Step $active={step >= 4}>✓</Step>
          </StepIndicator>

          {step === 1 && (
            <StepContent>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Your Information
              </h3>
              
              <FormGroup>
                <Label>Full Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </FormGroup>

              <FormGroup>
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01X-XXXXXXX"
                />
              </FormGroup>

              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </FormGroup>

              <div style={{ 
                background: '#f0f9f6', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                border: '1px solid #2fce98'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#2fce98', marginBottom: '4px' }}>
                  Session Fee
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F4A3A' }}>
                  RM15
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Single session entry
                </div>
              </div>

              <ButtonGroup>
                <SecondaryButton onClick={handleClose}>Cancel</SecondaryButton>
                <PrimaryButton 
                  onClick={() => setStep(2)}
                  disabled={!formData.name || !formData.phone || !formData.email}
                >
                  Next →
                </PrimaryButton>
              </ButtonGroup>
            </StepContent>
          )}

          {step === 2 && (
            <StepContent>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Payment Instructions
              </h3>

              <QRSection>
                <QRCode>
                  <img 
                    src="/Berse App Logo/Mira QR v1.1.jpg" 
                    alt="Payment QR Code" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '🏦';
                    }}
                  />
                </QRCode>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  Scan QR code to pay RM15
                </p>
                
                <BankInfo>
                  <BankDetail>
                    <DetailLabel>Bank:</DetailLabel>
                    <DetailValue>
                      Maybank
                      <CopyButton onClick={() => handleCopy('Maybank')}>Copy</CopyButton>
                    </DetailValue>
                  </BankDetail>
                  <BankDetail>
                    <DetailLabel>Account:</DetailLabel>
                    <DetailValue>
                      162354789652
                      <CopyButton onClick={() => handleCopy('162354789652')}>Copy</CopyButton>
                    </DetailValue>
                  </BankDetail>
                  <BankDetail>
                    <DetailLabel>Name:</DetailLabel>
                    <DetailValue>Sukan Squad</DetailValue>
                  </BankDetail>
                  <BankDetail>
                    <DetailLabel>Amount:</DetailLabel>
                    <DetailValue style={{ color: '#2fce98', fontSize: '16px' }}>
                      RM15
                    </DetailValue>
                  </BankDetail>
                </BankInfo>
              </QRSection>

              <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                Please complete the payment and save your receipt
              </p>

              <ButtonGroup>
                <SecondaryButton onClick={() => setStep(1)}>← Back</SecondaryButton>
                <PrimaryButton onClick={() => setStep(3)}>
                  I've Made Payment →
                </PrimaryButton>
              </ButtonGroup>
            </StepContent>
          )}

          {step === 3 && (
            <StepContent>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Upload Receipt
              </h3>

              <HiddenFileInput
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
              />

              {!uploadedFile ? (
                <FileUpload onClick={() => fileInputRef.current?.click()}>
                  <UploadIcon>📤</UploadIcon>
                  <UploadText>
                    Click to upload payment receipt<br />
                    <span style={{ fontSize: '11px', color: '#999' }}>
                      JPG, PNG or PDF (Max 5MB)
                    </span>
                  </UploadText>
                </FileUpload>
              ) : (
                <UploadedFile>
                  <span style={{ fontSize: '24px' }}>📄</span>
                  <FileInfo>
                    <FileName>{uploadedFile.name}</FileName>
                    <FileSize>{(uploadedFile.size / 1024).toFixed(1)} KB</FileSize>
                  </FileInfo>
                  <RemoveButton onClick={() => setUploadedFile(null)}>Remove</RemoveButton>
                </UploadedFile>
              )}

              <div style={{ marginTop: '16px', padding: '12px', background: '#fff3cd', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#856404' }}>
                  ⚠️ Your registration will be confirmed within 24 hours after receipt verification
                </p>
              </div>

              <ButtonGroup>
                <SecondaryButton onClick={() => setStep(2)}>← Back</SecondaryButton>
                <PrimaryButton 
                  onClick={handleSubmit}
                  disabled={!uploadedFile}
                >
                  Complete Registration
                </PrimaryButton>
              </ButtonGroup>
            </StepContent>
          )}

          {step === 4 && (
            <StepContent>
              <SuccessMessage>
                <SuccessIcon>✅</SuccessIcon>
                <SuccessTitle>Registration Successful!</SuccessTitle>
                <SuccessText>
                  Your registration has been received and is pending verification
                </SuccessText>
                
                <RegistrationNumber>
                  {registrationId}
                </RegistrationNumber>
                
                <SuccessText style={{ fontSize: '12px', marginTop: '8px' }}>
                  Save this registration number for your reference
                </SuccessText>

                <div style={{ 
                  background: '#f0f9f6', 
                  padding: '12px', 
                  borderRadius: '8px',
                  marginTop: '16px',
                  textAlign: 'left'
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                    What's Next?
                  </p>
                  <ul style={{ fontSize: '12px', color: '#666', margin: 0, paddingLeft: '20px' }}>
                    <li>You'll receive a confirmation WhatsApp within 24 hours</li>
                    <li>Join the WhatsApp group for updates</li>
                    <li>Show your registration ID at the venue</li>
                  </ul>
                </div>

                <ButtonGroup>
                  <PrimaryButton onClick={handleClose}>
                    Done
                  </PrimaryButton>
                </ButtonGroup>
              </SuccessMessage>
            </StepContent>
          )}
        </Body>
      </ModalContent>
    </Modal>
  );
};