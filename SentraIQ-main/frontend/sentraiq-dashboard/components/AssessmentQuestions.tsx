import React, { useState } from 'react';
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export interface AssessmentAnswer {
  questionId: string;
  question: string;
  answer: 'yes' | 'no' | 'partial' | null;
  evidence: string[];
  notes: string;
}

interface AssessmentQuestionsProps {
  framework: string;
  onComplete: (answers: AssessmentAnswer[]) => void;
  onBack: () => void;
}

// SWIFT CSCF v2023 Assessment Questions
const SWIFT_QUESTIONS = [
  {
    id: '1.1.d.1',
    section: '1. Secure Your Environment',
    subsection: '1.1 SWIFT Environment Protection',
    question: 'Has the user adequately controlled local operator (end user and administrator) access to the secure zone?',
    guideline: 'd.1'
  },
  {
    id: '1.1.d.2',
    section: '1. Secure Your Environment',
    subsection: '1.1 SWIFT Environment Protection',
    question: 'Has the user adequately controlled remote operator (teleworker, "on-call" staff, remote administrator) access to the secure zone?',
    guideline: 'd.2'
  },
  {
    id: '1.1.e',
    section: '1. Secure Your Environment',
    subsection: '1.1 SWIFT Environment Protection',
    question: 'Has the user adequately separated the secure zone from general enterprise IT services?',
    guideline: 'e'
  },
  {
    id: '1.2',
    section: '1. Secure Your Environment',
    subsection: '1.2 Operating System Privileged Account Control',
    question: 'Has the user restricted and controlled the allocation and usage of administrator-level operating system accounts?',
    guideline: 'Guideline'
  },
  {
    id: '1.3',
    section: '1. Secure Your Environment',
    subsection: '1.3 Virtualisation Platform Protection',
    question: 'Has the user secured the virtualisation platform or cloud and virtual machines (VMs) hosting SWIFT-related components to the same level as physical systems?',
    guideline: 'Guideline'
  },
  {
    id: '1.4',
    section: '1. Secure Your Environment',
    subsection: '1.4 Restriction of Internet Access',
    question: 'Has the user controlled/protected Internet access from operator PCs and systems within the secure zone?',
    guideline: 'Guideline'
  },
  {
    id: '1.5.e',
    section: '1. Secure Your Environment',
    subsection: '1.5 Customer Environment Protection',
    question: 'Has the user adequately separated the secure zone from general enterprise IT services?',
    guideline: 'e'
  },
  {
    id: '2.1',
    section: '2. Know and Limit Access',
    subsection: '2.1 Internal Data Flow Security',
    question: 'Has the user ensured the confidentiality, integrity, and authenticity of data flows between local SWIFT-related applications?',
    guideline: 'Guideline'
  },
  {
    id: '2.2',
    section: '2. Know and Limit Access',
    subsection: '2.2 Security Updates',
    question: 'Has the user ensured vendor support, applied mandatory software updates, and applied timely security updates aligned to the assessed risk?',
    guideline: 'Guideline'
  },
  {
    id: '2.3',
    section: '2. Know and Limit Access',
    subsection: '2.3 System Hardening',
    question: 'Has the user reduced the cyber attack surface of SWIFT-related components by performing system hardening?',
    guideline: 'Guideline'
  },
  {
    id: '2.6',
    section: '2. Know and Limit Access',
    subsection: '2.6 Operator Session Confidentiality and Integrity',
    question: 'Has the user protected the confidentiality and integrity of interactive operator sessions that connect to the local or remote SWIFT infrastructure?',
    guideline: 'Guideline'
  },
  {
    id: '2.7',
    section: '2. Know and Limit Access',
    subsection: '2.7 Vulnerability Scanning',
    question: 'Has the user identified known vulnerabilities within the local SWIFT environment by implementing a regular vulnerability scanning process and acting upon results?',
    guideline: 'Guideline'
  },
  {
    id: '2.9',
    section: '2. Know and Limit Access',
    subsection: '2.9 Transaction Business Controls',
    question: 'Has the user restricted transaction activity within the expected bounds of normal business by at least one detective or/and preventive control(s)?',
    guideline: 'Guideline'
  },
  {
    id: '2.10',
    section: '2. Know and Limit Access',
    subsection: '2.10 Application Hardening',
    question: 'Has the user adequately reduced the attack surface of SWIFT-related components by performing application hardening on the SWIFT-certified messaging and communication interfaces and related applications?',
    guideline: 'Guideline'
  },
  {
    id: '3.1',
    section: '3. Detect and Respond',
    subsection: '3.1 Physical Security',
    question: 'Has the user prevented unauthorized physical access to sensitive equipment, workplace environments, hosting sites, and storage?',
    guideline: 'Guideline'
  },
  {
    id: '4.1',
    section: '4. Password Policy & MFA',
    subsection: '4.1 Password Policy',
    question: 'Has the user ensured passwords are sufficiently resistant against common password attacks by implementing and enforcing an effective password policy?',
    guideline: 'Guideline'
  },
  {
    id: '4.2',
    section: '4. Password Policy & MFA',
    subsection: '4.2 Multi-Factor Authentication',
    question: 'Has the user implemented multi-factor authentication to prevent a compromise of a single authentication factor from allowing access into SWIFT-related systems?',
    guideline: 'Guideline'
  },
  {
    id: '5.1',
    section: '5. Logical Access & Token Management',
    subsection: '5.1 Logical Access Control',
    question: 'Has the user enforced the security principles of need-to-know access, least privilege, and separation of duties for operator accounts?',
    guideline: 'Guideline'
  },
  {
    id: '5.2',
    section: '5. Logical Access & Token Management',
    subsection: '5.2 Token Management',
    question: 'Has the user ensured the proper management, tracking, and use of connected and disconnected hardware authentication tokens (when tokens are used)?',
    guideline: 'Guideline'
  },
  {
    id: '5.4',
    section: '5. Logical Access & Token Management',
    subsection: '5.4 Physical and Logical Password Storage',
    question: 'Has the user protected physically and logically the repository of recorded passwords?',
    guideline: 'Guideline'
  },
  {
    id: '6.1',
    section: '6. Malware Protection & Integrity',
    subsection: '6.1 Malware Protection',
    question: 'Has the user ensured that local SWIFT infrastructure is protected against malware and acted upon results?',
    guideline: 'Guideline'
  },
  {
    id: '6.2',
    section: '6. Malware Protection & Integrity',
    subsection: '6.2 Software Integrity',
    question: 'Has the user ensured the software integrity of the SWIFT-related components?',
    guideline: 'Guideline'
  },
  {
    id: '6.3',
    section: '6. Malware Protection & Integrity',
    subsection: '6.3 Database Integrity',
    question: 'Has the user ensured the integrity of the database records for the SWIFT messaging interface?',
    guideline: 'Guideline'
  },
  {
    id: '6.4',
    section: '6. Malware Protection & Integrity',
    subsection: '6.4 Logging and Monitoring',
    question: 'Has the user recorded security events and detected anomalous actions and operations within the local SWIFT environment?',
    guideline: 'Guideline'
  },
  {
    id: '7.1',
    section: '7. Incident Response & Training',
    subsection: '7.1 Cyber Incident Response Planning',
    question: 'Has the user defined and tested a cyber incident response plan to ensure a consistent and effective approach for the management of cyber incidents?',
    guideline: 'Guideline'
  },
  {
    id: '7.2',
    section: '7. Incident Response & Training',
    subsection: '7.2 Security Training and Awareness',
    question: 'Has the user ensured all staff are aware of and fulfil their security responsibilities by performing regular awareness activities?',
    guideline: 'Guideline'
  }
];

const AssessmentQuestions: React.FC<AssessmentQuestionsProps> = ({ framework, onComplete, onBack }) => {
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [currentSection, setCurrentSection] = useState<string>('1. Secure Your Environment');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['1. Secure Your Environment']));

  const questions = framework === 'SWIFT_CSP' ? SWIFT_QUESTIONS : SWIFT_QUESTIONS; // Add other frameworks later

  const sections = Array.from(new Set(questions.map(q => q.section)));

  const updateAnswer = (questionId: string, question: string, answer: 'yes' | 'no' | 'partial' | null, notes: string = '') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        question,
        answer,
        evidence: prev[questionId]?.evidence || [],
        notes
      }
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getAnswerCount = () => {
    const answered = Object.values(answers).filter(a => a.answer !== null).length;
    return { answered, total: questions.length };
  };

  const handleComplete = () => {
    const answerArray = Object.values(answers);
    onComplete(answerArray);
  };

  const { answered, total } = getAnswerCount();
  const progress = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">SWIFT CSCF v2023 Assessment Questions</h2>
            <p className="text-gray-600">Answer the following questions to create your compliance assurance pack</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Progress</div>
            <div className="text-2xl font-bold text-blue-900">{answered}/{total}</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <motion.div
            className="bg-blue-900 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Answered: {answered}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-gray-700">Remaining: {total - answered}</span>
          </div>
        </div>
      </div>

      {/* Questions by Section */}
      <div className="space-y-4">
        {sections.map((section) => {
          const sectionQuestions = questions.filter(q => q.section === section);
          const sectionAnswers = sectionQuestions.filter(q => answers[q.id]?.answer !== null).length;
          const isExpanded = expandedSections.has(section);

          return (
            <div key={section} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section)}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    sectionAnswers === sectionQuestions.length 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {sectionAnswers}/{sectionQuestions.length}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{section}</h3>
                </div>
                <ArrowRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-5 space-y-6">
                    {sectionQuestions.map((q) => {
                      const currentAnswer = answers[q.id];
                      const subsections = questions.filter(qq => qq.subsection === q.subsection);
                      const isFirstInSubsection = subsections[0].id === q.id;

                      return (
                        <div key={q.id} className={isFirstInSubsection ? 'pt-4 border-t border-gray-100 first:border-t-0' : ''}>
                          {isFirstInSubsection && (
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">{q.subsection}</h4>
                          )}
                          
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {q.id}
                                  </span>
                                  <span className="text-xs text-gray-500">Guideline: {q.guideline}</span>
                                </div>
                                <p className="text-gray-900 font-medium">{q.question}</p>
                              </div>
                            </div>

                            {/* Answer Options */}
                            <div className="flex gap-3 mb-3">
                              {(['yes', 'partial', 'no'] as const).map((option) => {
                                const isSelected = currentAnswer?.answer === option;
                                return (
                                  <button
                                    key={option}
                                    onClick={() => updateAnswer(q.id, q.question, option, currentAnswer?.notes || '')}
                                    className={`
                                      px-4 py-2 rounded-lg text-sm font-medium transition-all
                                      ${isSelected
                                        ? option === 'yes'
                                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                          : option === 'partial'
                                          ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                                          : 'bg-red-100 text-red-700 border-2 border-red-300'
                                        : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                      }
                                    `}
                                  >
                                    {option === 'yes' ? '✓ Yes' : option === 'partial' ? '~ Partial' : '✗ No'}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Notes Field */}
                            <textarea
                              placeholder="Add notes or evidence references..."
                              value={currentAnswer?.notes || ''}
                              onChange={(e) => updateAnswer(q.id, q.question, currentAnswer?.answer || null, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={2}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Evidence Ingestion
        </button>

        <button
          onClick={handleComplete}
          disabled={answered === 0}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
            ${answered > 0
              ? 'bg-blue-900 text-white hover:bg-blue-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continue to Query Evidence
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AssessmentQuestions;
