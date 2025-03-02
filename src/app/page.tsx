'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, query as firestoreQuery, where, orderBy } from 'firebase/firestore';
import { app } from '@/app/lib/firebase';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, BarChart3, CalendarDays, Check } from "lucide-react";

// Initialize Firestore
const db = getFirestore(app);

// Complete emotion hierarchy
const emotionHierarchy = {
  happy: {
    color: '#FF9500',
    innerColor: '#FFA500',
    secondaryEmotions: {
      optimistic: {
        color: '#FFA500',
        tertiaryEmotions: ['Inspired', 'Hopeful']
      },
      trusting: {
        color: '#FFB52E',
        tertiaryEmotions: ['Intimate', 'Sensitive']
      },
      proud: {
        color: '#FFC04C',
        tertiaryEmotions: ['Successful', 'Confident']
      },
      excited: {
        color: '#FFCC66',
        tertiaryEmotions: ['Eager', 'Energetic']
      },
      content: {
        color: '#FFD580',
        tertiaryEmotions: ['Free', 'Joyful']
      },
      playful: {
        color: '#FFE0A3',
        tertiaryEmotions: ['Cheeky', 'Amused']
      },
      accepted: {
        color: '#FFEBC2',
        tertiaryEmotions: ['Respected', 'Valued']
      }
    }
  },
  sad: {
    color: '#483D8B',
    innerColor: '#4B0082',
    secondaryEmotions: {
      lonely: {
        color: '#4A368A',
        tertiaryEmotions: ['Isolated', 'Abandoned']
      },
      vulnerable: {
        color: '#4D3091',
        tertiaryEmotions: ['Victimized', 'Fragile']
      },
      despair: {
        color: '#512B9C',
        tertiaryEmotions: ['Powerless', 'Grief']
      },
      guilty: {
        color: '#5626A7',
        tertiaryEmotions: ['Remorseful', 'Ashamed']
      },
      depressed: {
        color: '#5C22B4',
        tertiaryEmotions: ['Empty', 'Inferior']
      },
      hurt: {
        color: '#631DC1',
        tertiaryEmotions: ['Disappointed', 'Embarrassed']
      }
    }
  },
  disgusted: {
    color: '#A0522D',
    innerColor: '#8B4513',
    secondaryEmotions: {
      disapproving: {
        color: '#9A4E2A',
        tertiaryEmotions: ['Judgemental', 'Critical']
      },
      disappointed: {
        color: '#8F4A27',
        tertiaryEmotions: ['Appalled', 'Revolted']
      },
      awful: {
        color: '#834623',
        tertiaryEmotions: ['Detestable', 'Nauseated']
      },
      repelled: {
        color: '#79421F',
        tertiaryEmotions: ['Avoidant', 'Hesitant']
      }
    }
  },
  angry: {
    color: '#FF0066',
    innerColor: '#FF1493',
    secondaryEmotions: {
      letDown: {
        color: '#FF0066',
        tertiaryEmotions: ['Resentful', 'Betrayed']
      },
      humiliated: {
        color: '#FF1A75',
        tertiaryEmotions: ['Disrespected', 'Ridiculed']
      },
      bitter: {
        color: '#FF3385',
        tertiaryEmotions: ['Indignant', 'Mad']
      },
      aggressive: {
        color: '#FF4D94',
        tertiaryEmotions: ['Provoked', 'Frustrated']
      },
      frustrated: {
        color: '#FF66A3',
        tertiaryEmotions: ['Annoyed', 'Distant']
      },
      critical: {
        color: '#FF80B2',
        tertiaryEmotions: ['Skeptical', 'Dismissive']
      }
    }
  },
  fearful: {
    color: '#8A2BE2',
    innerColor: '#4B0082',
    secondaryEmotions: {
      scared: {
        color: '#8533E0',
        tertiaryEmotions: ['Helpless', 'Frightened']
      },
      anxious: {
        color: '#7A3BD6',
        tertiaryEmotions: ['Overwhelmed', 'Worried']
      },
      insecure: {
        color: '#6F42CC',
        tertiaryEmotions: ['Inferior', 'Worthless']
      },
      weak: {
        color: '#644AC3',
        tertiaryEmotions: ['Insignificant', 'Inadequate']
      },
      rejected: {
        color: '#5A52B9',
        tertiaryEmotions: ['Alienated', 'Isolated']
      },
      threatened: {
        color: '#4F59AF',
        tertiaryEmotions: ['Nervous', 'Exposed']
      }
    }
  },
  bad: {
    color: '#6A5ACD',
    innerColor: '#6959CD',
    secondaryEmotions: {
      bored: {
        color: '#6A5ACD',
        tertiaryEmotions: ['Indifferent', 'Apathetic']
      },
      busy: {
        color: '#7363D1',
        tertiaryEmotions: ['Pressured', 'Rushed']
      },
      stressed: {
        color: '#7D6CD6',
        tertiaryEmotions: ['Overwhelmed', 'Anxious']
      },
      tired: {
        color: '#8675DB',
        tertiaryEmotions: ['Sleepy', 'Unfocussed']
      }
    }
  },
  surprised: {
    color: '#2AAA8A',
    innerColor: '#2E8B57',
    secondaryEmotions: {
      startled: {
        color: '#2AAA8A',
        tertiaryEmotions: ['Shocked', 'Dismayed']
      },
      confused: {
        color: '#33B594',
        tertiaryEmotions: ['Disillusioned', 'Perplexed']
      },
      amazed: {
        color: '#3CBF9E',
        tertiaryEmotions: ['Awed', 'Astonished']
      },
      excited: {
        color: '#46CAA8',
        tertiaryEmotions: ['Energetic', 'Eager']
      }
    }
  }
};

export default function Home() {
  const [step, setStep] = useState(1); // 1: Date, 2: Core Feeling, 3: Secondary Feeling, 4: Tertiary Feeling, 5: Description
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCore, setSelectedCore] = useState('');
  const [selectedSecondary, setSelectedSecondary] = useState('');
  const [selectedTertiary, setSelectedTertiary] = useState('');
  const [journalText, setJournalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [moodEntries, setMoodEntries] = useState([]);
  const [historicalEntry, setHistoricalEntry] = useState(null);

// Fetch mood entries
useEffect(() => {
  const fetchMoodEntries = async () => {
    if (step === 1 || step === 6 || step === 7) { // Added step === 1
      try {
        const moodsCollection = collection(db, 'moods');
        const q = firestoreQuery(moodsCollection, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          formattedDate: new Date(doc.data().date).toLocaleDateString()
        }));
        
        setMoodEntries(entries);
      } catch (error) {
        console.error('Error fetching mood entries:', error);
        setMessage('Failed to load mood data');
      }
    }
  };
  
  fetchMoodEntries();
}, [step, db]);

  // Navigate to next step
  const nextStep = () => {
    if (step === 1 && !selectedDate) {
      setMessage('Please select a date');
      return;
    }
    if (step === 2 && !selectedCore) {
      setMessage('Please select a core feeling');
      return;
    }
    if (step === 3 && !selectedSecondary) {
      setMessage('Please select a secondary feeling');
      return;
    }
    if (step === 4 && !selectedTertiary) {
      setMessage('Please select a tertiary feeling');
      return;
    }
    
    setMessage('');
    setStep(prev => prev + 1);
  };

  // Navigate to previous step
  const prevStep = () => {
    setMessage('');
    if (step === 3) {
      // Going back from secondary to core selection
      setSelectedSecondary('');
    } else if (step === 4) {
      // Going back from tertiary to secondary selection
      setSelectedTertiary('');
    }
    setStep(prev => prev - 1);
  };

  // Select a core emotion
  const selectCore = (core) => {
    setSelectedCore(core);
    setSelectedSecondary('');
    setSelectedTertiary('');
  };

  // Select a secondary emotion
  const selectSecondary = (secondary) => {
    setSelectedSecondary(secondary);
    setSelectedTertiary('');
  };

  // Select a tertiary emotion
  const selectTertiary = (tertiary) => {
    setSelectedTertiary(tertiary);
  };

  // Save mood entry to Firestore
  const saveMood = async () => {
    if (!journalText) {
      setMessage('Please enter some thoughts about your mood');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      await addDoc(collection(db, 'moods'), {
        date: formattedDate,
        coreFeeling: selectedCore,
        secondaryFeeling: selectedSecondary,
        tertiaryFeeling: selectedTertiary,
        journal: journalText,
        timestamp: new Date()
      });
      
      // Reset and go back to step 1
      setJournalText('');
      setSelectedCore('');
      setSelectedSecondary('');
      setSelectedTertiary('');
      setStep(1);
      setMessage('Mood saved successfully!');
    } catch (error) {
      console.error('Error saving mood:', error);
      setMessage('Error saving mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

 // Render date selection (Step 1)
const renderDateSelection = () => {
  // Create a lookup object for dates with entries
  const datesWithEntries = moodEntries.reduce((acc, entry) => {
    if (entry.date) {
      acc[entry.date] = true;
    }
    return acc;
  }, {});

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Choose Date</CardTitle>
        <CardDescription>Select the date for your mood entry</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              const dateStr = date.toISOString().split('T')[0];
              
              // Only allow selection if the date doesn't have an entry
              if (!datesWithEntries[dateStr]) {
                setSelectedDate(date);
              } else {
                // Show a message that this date already has an entry
                setMessage("This date already has a mood entry");
                setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
              }
            }
          }}
          modifiers={{
            hasEntry: (date) => {
              const dateStr = date.toISOString().split('T')[0];
              return !!datesWithEntries[dateStr];
            }
          }}
          modifiersClassNames={{
            hasEntry: 'bg-red-100 text-red-600 opacity-50'
          }}
          disabled={(date) => {
            const dateStr = date.toISOString().split('T')[0]; 
            return !!datesWithEntries[dateStr];
          }}
          className="rounded-md border"
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={nextStep}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

  // Render core emotion wheel (Step 2)
  const renderCoreSelection = () => {
    // Extract core emotions
    const coreEmotions = Object.keys(emotionHierarchy);
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>How are you feeling?</CardTitle>
          <CardDescription>Select a core emotion</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Core Emotion Wheel */}
          <div className="relative w-full aspect-square max-w-md mx-auto mb-8">
  <svg viewBox="0 0 200 200" className="w-full h-full">
    {/* Inner circle (center) */}
    <circle cx="100" cy="100" r="20" fill="white" stroke="#ddd" />
    <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#333" fontWeight="bold">Mood</text>
    
    {/* Core emotions (innermost circle) */}
    {coreEmotions.map((core, i) => {
      const totalSlices = coreEmotions.length;
      const sliceAngle = 360 / totalSlices;
      const startAngle = (i * sliceAngle) * (Math.PI / 180);
      const endAngle = ((i + 1) * sliceAngle) * (Math.PI / 180);
      
      // Make the wheel go all the way to the edge of the SVG for more space
      const x1 = 100 + 20 * Math.sin(startAngle);
      const y1 = 100 - 20 * Math.cos(startAngle);
      const x2 = 100 + 20 * Math.sin(endAngle);
      const y2 = 100 - 20 * Math.cos(endAngle);
      
      const x3 = 100 + 90 * Math.sin(endAngle);
      const y3 = 100 - 90 * Math.cos(endAngle);
      const x4 = 100 + 90 * Math.sin(startAngle);
      const y4 = 100 - 90 * Math.cos(startAngle);
      
      const pathData = [
        `M ${x1} ${y1}`,
        `L ${x4} ${y4}`,
        `A 90 90 0 0 1 ${x3} ${y3}`,
        `L ${x2} ${y2}`,
        `A 20 20 0 0 0 ${x1} ${y1}`,
        `Z`
      ].join(' ');
      
      const textAngle = ((i * sliceAngle) + (sliceAngle / 2)) * (Math.PI / 180);
      const textX = 100 + 55 * Math.sin(textAngle);
      const textY = 100 - 55 * Math.cos(textAngle);
      
      const isSelected = selectedCore === core;
      
      return (
        <g key={core} onClick={() => selectCore(core)} className="cursor-pointer hover:opacity-90">
          <path
            d={pathData}
            fill={emotionHierarchy[core].innerColor}
            stroke={isSelected ? 'white' : 'none'}
            strokeWidth={isSelected ? 3 : 0}
            opacity={isSelected ? 1 : 0.9}
          />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
            className="select-none pointer-events-none capitalize"
          >
            {core}
          </text>
        </g>
                );
              })}
            </svg>
          </div>
          
          {/* Selected core emotion display */}
          {selectedCore && (
            <div className="text-center">
              <p className="text-sm text-gray-500">Selected core emotion:</p>
              <p className="text-lg font-medium capitalize">{selectedCore}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={nextStep} 
            disabled={!selectedCore}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Render secondary emotion selection (Step 3)
  const renderSecondarySelection = () => {
    if (!selectedCore) return null;
    
    const secondaryEmotions = Object.keys(emotionHierarchy[selectedCore].secondaryEmotions);
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Select a secondary emotion</CardTitle>
          <CardDescription>How would you describe your {selectedCore} feeling?</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Secondary Emotion Wheel */}
          <div className="relative w-full aspect-square max-w-md mx-auto mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Inner circle with core emotion */}
              <circle cx="100" cy="100" r="40" fill={emotionHierarchy[selectedCore].innerColor} />
              <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="white" className="capitalize">
                {selectedCore}
              </text>
              
              {/* Secondary emotions (middle circle) */}
              {secondaryEmotions.map((secondary, i) => {
                const totalSlices = secondaryEmotions.length;
                const sliceAngle = 360 / totalSlices;
                const startAngle = (i * sliceAngle) * (Math.PI / 180);
                const endAngle = ((i + 1) * sliceAngle) * (Math.PI / 180);
                
                const x1 = 100 + 40 * Math.sin(startAngle);
                const y1 = 100 - 40 * Math.cos(startAngle);
                const x2 = 100 + 40 * Math.sin(endAngle);
                const y2 = 100 - 40 * Math.cos(endAngle);
                
                const x3 = 100 + 80 * Math.sin(endAngle);
                const y3 = 100 - 80 * Math.cos(endAngle);
                const x4 = 100 + 80 * Math.sin(startAngle);
                const y4 = 100 - 80 * Math.cos(startAngle);
                
                const pathData = [
                  `M ${x1} ${y1}`,
                  `L ${x4} ${y4}`,
                  `A 80 80 0 0 1 ${x3} ${y3}`,
                  `L ${x2} ${y2}`,
                  `A 40 40 0 0 0 ${x1} ${y1}`,
                  `Z`
                ].join(' ');
                
                const textAngle = ((i * sliceAngle) + (sliceAngle / 2)) * (Math.PI / 180);
                const textX = 100 + 60 * Math.sin(textAngle);
                const textY = 100 - 60 * Math.cos(textAngle);
                
                // Adjust text rotation for readability
                const textRotation = ((i * sliceAngle) + (sliceAngle / 2)) - 90;
                const adjustedRotation = textRotation > 90 && textRotation < 270 ? textRotation + 180 : textRotation;
                
                const isSelected = selectedSecondary === secondary;
                
                return (
                  <g key={secondary} onClick={() => selectSecondary(secondary)} className="cursor-pointer">
                    <path
                      d={pathData}
                      fill={emotionHierarchy[selectedCore].secondaryEmotions[secondary].color}
                      stroke={isSelected ? 'white' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="8"
                      transform={`rotate(${adjustedRotation}, ${textX}, ${textY})`}
                      className="select-none pointer-events-none capitalize"
                    >
                      {secondary.replace(/([A-Z])/g, ' $1').trim()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          {/* Selected emotions display */}
          <div className="text-center">
            <p className="text-sm text-gray-500">Selected emotions:</p>
            <p className="text-lg font-medium capitalize">
              {selectedCore}
              {selectedSecondary && ` → ${selectedSecondary.replace(/([A-Z])/g, ' $1').trim()}`}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={nextStep} 
            disabled={!selectedSecondary}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Render tertiary emotion selection (Step 4)
  const renderTertiarySelection = () => {
    if (!selectedCore || !selectedSecondary) return null;
    
    const tertiaryEmotions = emotionHierarchy[selectedCore].secondaryEmotions[selectedSecondary].tertiaryEmotions;
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Select a tertiary emotion</CardTitle>
          <CardDescription>
            How would you specifically describe your {selectedSecondary.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} feeling?
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tertiary emotion buttons */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {tertiaryEmotions.map((tertiary) => (
                <Button
                  key={tertiary}
                  variant={selectedTertiary === tertiary ? "default" : "outline"}
                  className="w-full justify-center text-lg py-6"
                  onClick={() => selectTertiary(tertiary)}
                >
                  {tertiary}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Selected emotions display */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">Selected emotions:</p>
            <p className="text-md font-medium capitalize">
              {selectedCore} → 
              {selectedSecondary && ` ${selectedSecondary.replace(/([A-Z])/g, ' $1').trim()} → `}
              {selectedTertiary}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={nextStep} 
            disabled={!selectedTertiary}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };


  // Render monthly chart (Step 6)
const renderMonthlyChart = () => {
  // Group entries by core emotion
  const monthEntries = moodEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === selectedDate.getMonth() && 
           entryDate.getFullYear() === selectedDate.getFullYear();
  });
  
  const emotionCounts = {};
  Object.keys(emotionHierarchy).forEach(emotion => {
    emotionCounts[emotion] = 0;
  });
  
  monthEntries.forEach(entry => {
    if (entry.coreFeeling && emotionCounts.hasOwnProperty(entry.coreFeeling)) {
      emotionCounts[entry.coreFeeling]++;
    }
  });
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Monthly Emotion Summary</CardTitle>
        <CardDescription>
          Emotions for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {monthEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No mood entries for this month
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                {Object.entries(emotionCounts).map(([emotion, count]) => {
                  if (count === 0) return null;
                  return (
                    <div 
                      key={emotion} 
                      className="flex items-center p-2 rounded-md"
                      style={{ backgroundColor: `${emotionHierarchy[emotion].innerColor}20` }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: emotionHierarchy[emotion].innerColor }}
                      />
                      <span className="capitalize">{emotion}:</span>
                      <span className="ml-auto font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Chart visualization */}
            <div className="w-full h-40 relative">
              <div className="flex h-full items-end">
                {Object.entries(emotionCounts).map(([emotion, count]) => {
                  if (count === 0) return null;
                  const percentage = (count / monthEntries.length) * 100;
                  return (
                    <div 
                      key={emotion}
                      className="flex-1 mx-1 rounded-t-md flex flex-col items-center justify-end"
                      style={{ 
                        height: `${percentage}%`, 
                        backgroundColor: emotionHierarchy[emotion].innerColor,
                        minHeight: '10%'
                      }}
                    >
                      <span className="text-white text-xs font-bold mb-1">{count}</span>
                      <span className="text-white text-xs capitalize truncate w-full text-center">
                        {emotion}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Month selector */}
        <div className="flex justify-between items-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => {
              const prevMonth = new Date(selectedDate);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setSelectedDate(prevMonth);
            }}
          >
            Previous Month
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const nextMonth = new Date(selectedDate);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setSelectedDate(nextMonth);
            }}
          >
            Next Month
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => setStep(1)}>
          Back to Mood Tracker
        </Button>
      </CardFooter>
    </Card>
  );
};

// Render history view (Step 7)
const renderHistoryView = () => {
  // Format mood entries by date for the calendar
  const datesWithEntries = moodEntries.reduce((acc, entry) => {
    if (entry.date) {
      // Store entries by their date string for easy lookup
      acc[entry.date] = entry;
    }
    return acc;
  }, {});
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mood History</CardTitle>
        <CardDescription>
          View your past mood entries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                // Use UTC date to avoid timezone issues
                // This converts the date to YYYY-MM-DD in UTC timezone
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                
                // For debugging
                console.log('Selected date (calendar):', dateStr);
                console.log('Available dates:', Object.keys(datesWithEntries));
                
                // Check if this exact string exists in our entries
                if (datesWithEntries[dateStr]) {
                  setSelectedDate(date);
                  setHistoricalEntry(datesWithEntries[dateStr]);
                  console.log('Found entry:', datesWithEntries[dateStr]);
                } else {
                  // Try with local timezone conversion as fallback
                  const localDateStr = date.toISOString().split('T')[0];
                  console.log('Trying local date format:', localDateStr);
                  
                  if (datesWithEntries[localDateStr]) {
                    setSelectedDate(date);
                    setHistoricalEntry(datesWithEntries[localDateStr]);
                    console.log('Found entry with local format:', datesWithEntries[localDateStr]);
                  } else {
                    // No entry found with either format
                    setHistoricalEntry(null);
                    setMessage("No mood entry for this date");
                    setTimeout(() => setMessage(""), 3000);
                  }
                }
              }
            }}
            modifiers={{
              hasEntry: (date) => {
                // Try both UTC and local formats
                const utcYear = date.getUTCFullYear();
                const utcMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
                const utcDay = String(date.getUTCDate()).padStart(2, '0');
                const utcDateStr = `${utcYear}-${utcMonth}-${utcDay}`;
                
                const localDateStr = date.toISOString().split('T')[0];
                
                return !!datesWithEntries[utcDateStr] || !!datesWithEntries[localDateStr];
              }
            }}
            modifiersClassNames={{
              hasEntry: 'bg-blue-100 font-bold text-blue-600 cursor-pointer'
            }}
            disabled={(date) => {
              // Try both UTC and local formats
              const utcYear = date.getUTCFullYear();
              const utcMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
              const utcDay = String(date.getUTCDate()).padStart(2, '0');
              const utcDateStr = `${utcYear}-${utcMonth}-${utcDay}`;
              
              const localDateStr = date.toISOString().split('T')[0];
              
              return !datesWithEntries[utcDateStr] && !datesWithEntries[localDateStr];
            }}
            className="rounded-md border"
          />
        </div>
        
        {historicalEntry ? (
          <div className="bg-white p-4 rounded-md border">
            <h3 className="font-bold text-lg mb-2">
              {/* Display the actual date from the entry instead of the selected date */}
              {new Date(historicalEntry.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            
            <div className="space-y-2 mb-4">
              <div>
                <span className="text-gray-500">Core feeling:</span> 
                <span 
                  className="ml-2 px-2 py-1 rounded-full text-white text-sm capitalize"
                  style={{ backgroundColor: emotionHierarchy[historicalEntry.coreFeeling]?.innerColor || '#888' }}
                >
                  {historicalEntry.coreFeeling}
                </span>
              </div>
              
              {historicalEntry.secondaryFeeling && (
                <div>
                  <span className="text-gray-500">Secondary feeling:</span> 
                  <span className="ml-2 font-medium capitalize">
                    {historicalEntry.secondaryFeeling.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              )}
              
              {historicalEntry.tertiaryFeeling && (
                <div>
                  <span className="text-gray-500">Specific feeling:</span> 
                  <span className="ml-2 font-medium">{historicalEntry.tertiaryFeeling}</span>
                </div>
              )}
            </div>
            
            {historicalEntry.journal && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-1">Journal entry:</h4>
                <p className="bg-gray-50 p-3 rounded">{historicalEntry.journal}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Select a highlighted date to view mood details
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => setStep(1)}>
          Back to Mood Tracker
        </Button>
      </CardFooter>
    </Card>
  );
};

  // Render journal entry (Step 5)
  const renderJournalEntry = () => {
    if (!selectedCore || !selectedSecondary || !selectedTertiary) return null;
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Journal your thoughts</CardTitle>
          <CardDescription>
            Describe why you're feeling {selectedTertiary.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Selected emotion path display */}
          <div className="bg-gray-100 p-3 rounded-md mb-4 text-center">
            <p className="text-sm text-gray-500">Your emotion:</p>
            <p className="font-medium">
              {selectedCore} → {selectedSecondary.replace(/([A-Z])/g, ' $1').trim()} → {selectedTertiary}
            </p>
          </div>
          
          <Textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="How are you feeling today? What's on your mind?"
            className="min-h-32"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={saveMood} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Mood'} {!isSubmitting && <Check className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Mood Tracker</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setStep(6)} // Set to step 6 for monthly chart view
              className="flex items-center gap-1"
            >
              <BarChart3 className="h-4 w-4" /> Monthly Chart
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setStep(7)} // Set to step 7 for calendar history view
              className="flex items-center gap-1"
            >
              <CalendarDays className="h-4 w-4" /> History
            </Button>
          </div>
        </div>
        <p className="text-gray-500 text-center mb-6">Track how you feel each day</p>
        
        {message && (
          <div className={`mb-4 p-3 rounded-md text-center ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
        {/* Progress indicator - only show for steps 1-5 */}
        {step <= 5 && (
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full mx-0.5 ${
                  s === step ? 'bg-blue-600 flex-1' : 
                  s < step ? 'bg-blue-300 flex-1' : 'bg-gray-200 flex-1'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Render current step */}
        {step === 1 && renderDateSelection()}
        {step === 2 && renderCoreSelection()}
        {step === 3 && renderSecondarySelection()}
        {step === 4 && renderTertiarySelection()}
        {step === 5 && renderJournalEntry()}
        {step === 6 && renderMonthlyChart()}
        {step === 7 && renderHistoryView()}
      </div>
    </div>
  );
}