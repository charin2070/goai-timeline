'use client';

import { Button } from '@/components/catalyst-ui-kit/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TetrisSpinner } from '../ui/tetris-spinner';

export function SignIn() {
  const { signIn, isLoading } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Задержка для начала анимации
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleSignIn = async () => {
    await signIn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 relative">

      <Card 
        className={`w-full max-w-md bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 shadow-2xl transition-all duration-1000 ease-out ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-8'
        }`}
        style={{
          animation: isVisible ? 'tetris-assemble 1.2s ease-out forwards' : 'none'
        }}
      >
        <CardHeader className="text-center">
          
            <svg width="84" height="84" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                <title>Icon_24px_Dialogflow_Color</title>
                <g data-name="Product Icons">
                  <g data-name="colored-32/dialogflow-enterprise">
                    <g data-name="32px_Dialogflow-Favicon">
                      <path 
                        fill="var(--product-primary-color)" 
                        d="M12,12,4,8v6.76a.49.49,0,0,0,.19.39L8.83,17.9a.32.32,0,0,1,.17.29V21.7a.17.17,0,0,0,.26.14l10.51-6.69a.5.5,0,0,0,.23-.42V8Z"
                      />
                    </g>
                  </g>
                </g>
              </svg>
        
          <CardTitle className={`text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Войти в GoAI
            {/* Войти в Go AI */}
          </CardTitle>
          <CardDescription className={`text-gray-400 text-lg mt-2 transition-all duration-700 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
          
          </CardDescription>
        </CardHeader>
        <CardContent className={`space-y-6 transition-all duration-700 delay-900 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-black-600 to-white-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <Button
              plain
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20 flex items-center justify-center gap-4 py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="relative">
                <svg 
                  className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`} 
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <span className="text-lg font-medium">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <TetrisSpinner width={'5em'}/>
                  </div>
                ) : (
                  'Войти с Google'
                )}
              </span>
              {!isLoading && (
                <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-500 text-sm">
             * Только для доверенных аккаунтов
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}