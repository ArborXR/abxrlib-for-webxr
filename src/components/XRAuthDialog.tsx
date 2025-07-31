import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  Fullscreen, 
  Container, 
  Text, 
  Input,
  Button,
  Row,
  Column
} from '@react-three/uikit';
import { AuthMechanismData } from '../index';

interface XRAuthDialogProps {
  authData: AuthMechanismData;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  errorMessage?: string;
  visible: boolean;
}

export function XRAuthDialog({ 
  authData, 
  onSubmit, 
  onCancel, 
  errorMessage, 
  visible 
}: XRAuthDialogProps) {
  const [inputValue, setInputValue] = useState('');

  if (!visible) return null;

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
    }
  };

  const getPlaceholder = () => {
    if (authData.type === 'email') {
      return authData.domain ? `Enter username (will use @${authData.domain})` : 'Enter email address';
    } else if (authData.type === 'assessmentPin' || authData.type === 'pin') {
      return 'Enter PIN';
    }
    return 'Enter value';
  };

  const getTitle = () => {
    if (authData.prompt) {
      return authData.prompt;
    }
    
    if (authData.type === 'email') {
      return 'Email Authentication Required';
    } else if (authData.type === 'assessmentPin' || authData.type === 'pin') {
      return 'PIN Authentication Required';
    }
    
    return 'Additional Authentication Required';
  };

  return (
    <Canvas 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.8)'
      }}
      gl={{ localClippingEnabled: true }}
    >
      <Fullscreen 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center"
        padding={20}
      >
        {/* Main Dialog Container */}
        <Container
          width={400}
          height={300}
          backgroundColor="#1a1a1a"
          borderRadius={10}
          padding={20}
          flexDirection="column"
          gap={15}
          border={2}
          borderColor="#333"
        >
          {/* Title */}
          <Text 
            fontSize={18} 
            color="white" 
            textAlign="center"
            fontWeight="bold"
          >
            {getTitle()}
          </Text>

          {/* Domain info for email type */}
          {authData.type === 'email' && authData.domain && (
            <Text 
              fontSize={12} 
              color="#ccc" 
              textAlign="center"
            >
              Domain: @{authData.domain}
            </Text>
          )}

          {/* Error message */}
          {errorMessage && (
            <Container
              backgroundColor="#ff4444"
              borderRadius={5}
              padding={10}
            >
              <Text 
                fontSize={12} 
                color="white" 
                textAlign="center"
              >
                {errorMessage}
              </Text>
            </Container>
          )}

          {/* Input field - using a styled container since Input might not be available */}
          <Container
            height={40}
            backgroundColor="#333"
            borderRadius={5}
            padding={10}
            border={1}
            borderColor="#555"
            justifyContent="center"
          >
            <Text 
              fontSize={14} 
              color={inputValue ? "white" : "#888"}
            >
              {inputValue || getPlaceholder()}
            </Text>
          </Container>

          {/* Buttons */}
          <Row gap={10} justifyContent="center">
            <Button
              onClick={onCancel}
              backgroundColor="#666"
              color="white"
              padding={[10, 20]}
              borderRadius={5}
              fontSize={14}
            >
              <Text>Cancel</Text>
            </Button>
            
            <Button
              onClick={handleSubmit}
              backgroundColor="#007bff"
              color="white"
              padding={[10, 20]}
              borderRadius={5}
              fontSize={14}
            >
              <Text>Submit</Text>
            </Button>
          </Row>

          {/* Instructions */}
          <Text 
            fontSize={10} 
            color="#888" 
            textAlign="center"
          >
            Use your VR controller to interact with this dialog
          </Text>
        </Container>
      </Fullscreen>
    </Canvas>
  );
}

// Fallback component for when React Three Fiber components aren't available
export function XRAuthDialogFallback({ 
  authData, 
  onSubmit, 
  onCancel, 
  errorMessage, 
  visible 
}: XRAuthDialogProps) {
  const [inputValue, setInputValue] = useState('');

  if (!visible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
    }
  };

  const getPlaceholder = () => {
    if (authData.type === 'email') {
      return authData.domain ? `Enter username (will use @${authData.domain})` : 'Enter email address';
    } else if (authData.type === 'assessmentPin' || authData.type === 'pin') {
      return 'Enter PIN';
    }
    return 'Enter value';
  };

  const getTitle = () => {
    if (authData.prompt) {
      return authData.prompt;
    }
    
    if (authData.type === 'email') {
      return 'Email Authentication Required';
    } else if (authData.type === 'assessmentPin' || authData.type === 'pin') {
      return 'PIN Authentication Required';
    }
    
    return 'Additional Authentication Required';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '30px',
        borderRadius: '10px',
        border: '2px solid #333',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>
          {getTitle()}
        </h2>

        {authData.type === 'email' && authData.domain && (
          <p style={{ 
            fontSize: '12px', 
            color: '#ccc', 
            textAlign: 'center',
            margin: '0 0 15px 0'
          }}>
            Domain: @{authData.domain}
          </p>
        )}

        {errorMessage && (
          <div style={{
            backgroundColor: '#ff4444',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            textAlign: 'center',
            fontSize: '12px'
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type={authData.type === 'assessmentPin' || authData.type === 'pin' ? 'password' : 'text'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={getPlaceholder()}
            autoFocus
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #555',
              backgroundColor: '#333',
              color: 'white',
              marginBottom: '20px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Submit
            </button>
          </div>
        </form>

        <p style={{ 
          fontSize: '10px', 
          color: '#888', 
          textAlign: 'center',
          margin: '15px 0 0 0' 
        }}>
          XR Dialog Fallback - Use keyboard and mouse to interact
        </p>
      </div>
    </div>
  );
}