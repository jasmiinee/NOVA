// Mock data for the PSA Career Growth application

export const mockData = {
  profile: {
    id: 1,
    name: 'Samantha Lee',
    email: 'samantha.lee@globalpsa.com',
    jobTitle: 'Cloud Solutions Architect',
    department: 'Information Technology',
    unit: 'Infrastructure Architecture & Cloud',
    manager: 'Victor Tan',
    office: 'PSA Singapore',
    hireDate: '2016-03-15',
    inRoleSince: '2022-07-01',
    avatar: 'https://via.placeholder.com/100x100.png?text=SL',
    languages: [
      { name: 'English', level: 'Fluent' },
      { name: 'Korean', level: 'Intermediate' }
    ]
  },

  skills: [
    {
      function: 'Info Tech: Infrastructure',
      specialization: 'Cloud Computing',
      skill: 'Cloud Architecture',
      level: 4
    },
    {
      function: 'Info Tech: Infrastructure',
      specialization: 'Cloud Computing',
      skill: 'Cloud DevOps & Automation',
      level: 4
    },
    {
      function: 'Info Tech: Infrastructure',
      specialization: 'Cloud Computing',
      skill: 'Securing Cloud Infrastructure',
      level: 3
    },
    {
      function: 'Info Tech: Infrastructure',
      specialization: 'Infrastructure Architecture',
      skill: 'Network Architecture',
      level: 3
    },
    {
      function: 'Info Tech: Infrastructure',
      specialization: 'Systems & Middleware Management',
      skill: 'Middleware & Web Servers',
      level: 3
    },
    {
      function: 'Info Tech: IT Governance & Strategy',
      specialization: 'Enterprise Architecture',
      skill: 'Enterprise Architecture',
      level: 2
    }
  ],

  competencies: [
    'Stakeholder & Partnership Management',
    'Change & Transformation Management',
    'Technology Management & Innovation'
  ],

  careerHistory: [
    {
      title: 'Cloud Solutions Architect',
      duration: '2022-07-01 – Present',
      focusAreas: ['Hybrid cloud design', 'Security-by-design', 'Cost optimization']
    },
    {
      title: 'Senior Systems Engineer',
      duration: '2019-01-01 – 2022-06-30',
      focusAreas: ['Containerization', 'Infrastructure automation']
    },
    {
      title: 'Systems Engineer',
      duration: '2016-03-15 – 2018-12-31',
      focusAreas: ['On-prem server operations', 'Network administration']
    }
  ],

  projects: [
    {
      name: 'Hybrid Cloud Migration Initiative',
      role: 'Lead Architect',
      duration: '2022-08-01 – 2023-12-31',
      achievements: [
        '30% infrastructure cost reduction',
        '99.95% service availability achieved',
        'Zero-trust access implementation'
      ]
    }
  ],

  careerPathways: [
    {
      title: 'Senior Cloud Architect',
      readiness: 75,
      timeEstimate: '6-9 months',
      requiredSkills: ['Advanced Cloud Architecture', 'Multi-cloud Strategy', 'Team Leadership'],
      skillGaps: ['Team Leadership', 'Multi-cloud Strategy']
    },
    {
      title: 'Cloud Security Lead',
      readiness: 60,
      timeEstimate: '12-15 months',
      requiredSkills: ['Advanced Security Architecture', 'Compliance Management', 'Risk Assessment'],
      skillGaps: ['Compliance Management', 'Risk Assessment', 'Advanced Security Architecture']
    },
    {
      title: 'Enterprise Architect',
      readiness: 45,
      timeEstimate: '18-24 months',
      requiredSkills: ['Enterprise Architecture', 'Business Strategy', 'Digital Transformation'],
      skillGaps: ['Business Strategy', 'Digital Transformation', 'Advanced Enterprise Architecture']
    }
  ],

  learningRecommendations: [
    {
      title: 'Advanced Cloud Security Certification',
      provider: 'AWS/Azure',
      duration: '40 hours',
      relevance: 'Addresses security architecture gap for Cloud Security Lead path',
      progress: 0
    },
    {
      title: 'Leadership for Technical Professionals',
      provider: 'PSA Learning Academy',
      duration: '20 hours',
      relevance: 'Develops leadership skills for Senior Cloud Architect role',
      progress: 25
    },
    {
      title: 'Enterprise Architecture Fundamentals',
      provider: 'TOGAF',
      duration: '60 hours',
      relevance: 'Foundation for Enterprise Architect pathway',
      progress: 0
    }
  ],

  recentLearning: [
    {
      title: 'Leadership for Technical Professionals',
      provider: 'PSA Learning Academy',
      progress: 25
    },
    {
      title: 'Multi-Cloud Strategy',
      provider: 'Cloud Institute',
      progress: 80
    },
    {
      title: 'Advanced Kubernetes',
      provider: 'Linux Foundation',
      progress: 60
    }
  ],

  mentorshipMatches: [
    {
      name: 'Dr. James Wong',
      title: 'Principal Enterprise Architect',
      expertise: ['Enterprise Architecture', 'Digital Transformation'],
      matchScore: 92,
      avatar: 'https://via.placeholder.com/60x60.png?text=JW'
    },
    {
      name: 'Sarah Chen',
      title: 'Head of Cloud Security',
      expertise: ['Cloud Security', 'Compliance', 'Risk Management'],
      matchScore: 88,
      avatar: 'https://via.placeholder.com/60x60.png?text=SC'
    },
    {
      name: 'Michael Kumar',
      title: 'Senior Director, IT Architecture',
      expertise: ['Leadership', 'Team Management', 'Strategic Planning'],
      matchScore: 85,
      avatar: 'https://via.placeholder.com/60x60.png?text=MK'
    }
  ],

  upcomingSessions: [
    {
      title: 'Mentoring Session with Dr. James Wong',
      date: '2025-10-20',
      time: '2:00 PM',
      type: 'Mentoring'
    },
    {
      title: 'Cloud Security Workshop',
      date: '2025-10-22',
      time: '10:00 AM',
      type: 'Learning'
    },
    {
      title: 'Leadership Skills Assessment',
      date: '2025-10-25',
      time: '3:30 PM',
      type: 'Assessment'
    }
  ],

  internalOpportunities: [
    {
      title: 'Senior Cloud Architect',
      department: 'IT Infrastructure',
      location: 'Singapore',
      posted: '2025-10-10',
      matchScore: 85,
      requirements: ['5+ years cloud architecture', 'Leadership experience', 'Multi-cloud expertise']
    },
    {
      title: 'Cloud Security Specialist',
      department: 'Information Security',
      location: 'Singapore',
      posted: '2025-10-08',
      matchScore: 70,
      requirements: ['Cloud security expertise', 'Compliance knowledge', 'Risk assessment skills']
    }
  ],

  leadershipAssessment: {
    overallScore: 72,
    dimensions: [
      {
        name: 'Strategic Thinking',
        score: 75,
        description: 'Demonstrates good strategic planning in cloud migration projects'
      },
      {
        name: 'Team Leadership',
        score: 65,
        description: 'Shows potential but needs more formal leadership experience'
      },
      {
        name: 'Innovation',
        score: 80,
        description: 'Strong track record of implementing new technologies'
      },
      {
        name: 'Communication',
        score: 70,
        description: 'Effective stakeholder management and technical communication'
      }
    ],
    developmentAreas: [
      'Formal leadership training',
      'Cross-functional project management',
      'Business strategy alignment'
    ]
  },

  chatHistory: [
    {
      id: 1,
      message: 'Hi! How can I help you with your career development today?',
      sender: 'ai',
      timestamp: '2025-10-17T10:00:00Z'
    }
  ]
};