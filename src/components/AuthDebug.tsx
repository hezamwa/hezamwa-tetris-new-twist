import React from 'react';
import { Paper, Typography, Box, Alert } from '@mui/material';

interface AuthDebugProps {
  error?: Error | null;
  isVisible?: boolean;
}

export const AuthDebug: React.FC<AuthDebugProps> = ({ error, isVisible = false }) => {
  if (!isVisible || !error) return null;

  const isMicrosoftError = error.message?.includes('microsoft.com') || 
                          error.message?.includes('AADSTS') ||
                          error.message?.includes('Invalid client secret');

  const microsoftErrorCode = error.message?.match(/AADSTS(\d+)/)?.[1];

  const getMicrosoftErrorHelp = (code: string) => {
    switch (code) {
      case '7000215':
        return {
          title: 'Invalid Client Secret',
          description: 'The client secret value is incorrect.',
          solution: [
            '1. Go to Azure Portal > App registrations > Your app',
            '2. Navigate to "Certificates & secrets"',
            '3. Create a new client secret',
            '4. Copy the VALUE (not the Secret ID)',
            '5. Update Firebase Console with the new secret VALUE'
          ]
        };
      case '50011':
        return {
          title: 'Invalid Redirect URI',
          description: 'The redirect URI is not properly configured.',
          solution: [
            '1. Check that redirect URI in Azure AD is exactly:',
            '   https://yourproject.firebaseapp.com/__/auth/handler',
            '2. Replace "yourproject" with your actual Firebase project ID',
            '3. Make sure it\'s set as "Web" type, not "SPA"'
          ]
        };
      case '9002313':
        return {
          title: 'Application Not Found',
          description: 'The application ID is incorrect.',
          solution: [
            '1. Verify the Application (client) ID in Azure Portal',
            '2. Make sure it matches exactly in Firebase Console',
            '3. Check there are no extra spaces or characters'
          ]
        };
      default:
        return {
          title: 'Microsoft Authentication Error',
          description: 'Unknown Microsoft Azure AD error.',
          solution: [
            '1. Check Azure AD app configuration',
            '2. Verify Firebase Microsoft provider settings',
            '3. Ensure all credentials are correct'
          ]
        };
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2, bgcolor: '#f5f5f5' }}>
      <Typography variant="h6" color="error" gutterBottom>
        🔧 Authentication Debug Information
      </Typography>
      
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Error:</strong> {error.message}
        </Typography>
      </Alert>

      {isMicrosoftError && microsoftErrorCode && (
        <Box sx={{ mt: 2 }}>
          {(() => {
            const help = getMicrosoftErrorHelp(microsoftErrorCode);
            return (
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  <strong>{help.title}</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {help.description}
                </Typography>
                <Typography variant="body2" component="div">
                  <strong>Solution:</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {help.solution.map((step, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>
                        {step}
                      </li>
                    ))}
                  </ul>
                </Typography>
              </Alert>
            );
          })()}
        </Box>
      )}

      <Box sx={{ mt: 2, p: 2, bgcolor: '#fff', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Debug Info:</strong><br />
          Error Code: {(error as any)?.code || 'N/A'}<br />
          Timestamp: {new Date().toISOString()}<br />
          User Agent: {navigator.userAgent.split(' ').slice(-2).join(' ')}
        </Typography>
      </Box>
    </Paper>
  );
}; 