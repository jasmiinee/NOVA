import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { mockData } from '../data/mockData';

export const CareerPathways = () => {
    const [pathways, setPathways] = useState([]);
    const [selectedPathway, setSelectedPathway] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setPathways(mockData.careerPathways);
            setSelectedPathway(mockData.careerPathways[0]);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="big-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Career Pathways</h1>
                <p className="text-gray-600">
                    Explore various personalized career pathways based on your current skills and aspirations.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Pathway Cards */}
                <div className='lg:col-span-1 space-y-4'>
                    {pathways.map((pathway, index) => (
                        <PathwayCard
                            key={index}
                            pathway={pathway}
                            isSelected={selectedPathway?.title === pathway.title}
                            onClick={() => setSelectedPathway(pathway)}
                        />
                    ))}
                </div>

                {/* Pathway Details */}
                <div className='lg:col-span-2'>
                    {selectedPathway && (
                        <PathwayDetails pathway={selectedPathway} />
                    )}
                </div>
            </div>

            {/* Current Role Skills */}
            <div className="big-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Current Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockData.skills.map((skill, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium text-gray-900">{skill.skill}</h4>
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-2 w-2 rounded-full mr-1 ${
                                                i < skill.level ? 'bg-green-500' : 'bg-gray-200'}
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Level {skill.level}/5</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PathwayCard = ({ pathway, isSelected, onClick }) => {
    const getReadinessColor = (readiness) => {
        if (readiness >= 70) return 'text-green-600 bg-green-100';
        if (readiness >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div
            className={`cursor-pointer big-white rounded-lg shadow p-4 transition-all duration-200 ${
                isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-md'
            }`}
            onClick={onClick}
        >
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{pathway.title}</h3>
                <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Readiness</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${getReadinessColor(pathway.readiness)}`}>
                        {pathway.readiness}%
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time to Goal</span>
                    <span className="text-sm font-medium text-gray-900">{pathway.timeEstimate}</span>
                </div>

                <div>
                    <p className="text-sm text-gray-600 mb-1">Skills to Develop</p>
                    <div className="flex flex-wrap gap-1">
                        {pathway.skillGaps.slice(0, 2).map((skill, index) => (
                            <span key={index} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                {skill}
                            </span>
                        ))}
                        {pathway.skillGaps.length > 2 && (
                            <span className="text-xs bg-gray-500">+{pathway.skillGaps.length - 2} more</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PathwayDetails = ({ pathway }) => {
    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{pathway.title}</h2>
                        <p className="text-gray-600 mt-1">Detailed pathway analysis and recommendations</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{pathway.readiness}%</div>
                        <div className="text-sm text-gray-500">Ready</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Timeline */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Clock className="h-5 w-5 text-blue-500 mr-2" />
                        Estimated Timeline: {pathway.timeEstimate}
                    </h3>
                    <div className="bg-gray-100 rounded-full h-2 mb-4">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pathway.readiness}%` }}
                        ></div>
                    </div>
                </div>

                {/* Required Skills */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Target className="h-5 w-5 text-green-500 mr-2" />
                        Required Skills
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pathway.requiredSkills.map((skill, index) => {
                            const hasSkill = !pathway.skillGaps.includes(skill);
                            return (
                                <div key={index} className="flex items-center">
                                    {hasSkill ? (
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                                    )}
                                    <span className={hasSkill ? 'text-gray-900' : 'text-red-600'}>
                                        {skill}
                                    </span>
                                    {hasSkill && (
                                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                            Acquired
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Skill Gaps */}
                {pathway.skillGaps.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                            Skills to Develop
                        </h3>
                        <div className="space-y-3">
                            {pathway.skillGaps.map((skill, index) => {
                                const recommendation = mockData.learningRecommendations.find(
                                    rec => rec.title.toLowerCase().includes(skill.toLowerCase().split(' ')[0])
                                );
                                return (
                                    <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-red-900">{skill}</h4>
                                                {recommendation && (
                                                    <p className="text-sm text-red-700 mt-1">
                                                        Recommended: {recommendation.title} ({recommendation.duration})
                                                    </p>
                                                )}
                                            </div>
                                            <button className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors">
                                                Start Learning
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Action Plan */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Action Plan</h3>
                    <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h4 className="font-medium text-gray-900">Phase 1 (Next 3 months)</h4>
                            <ul className="text-sm text-gray-600 mt-1 space-y-1">
                                <li>• Complete foundational courses in identified skill gaps</li>
                                <li>• Find a mentor in the target role area</li>
                                <li>• Start working on stretch projects</li>
                            </ul>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                            <h4 className="font-medium text-gray-900">Phase 2 (3-6 months)</h4>
                            <ul className="text-sm text-gray-600 mt-1 space-y-1">
                                <li>• Apply learning in real projects</li>
                                <li>• Seek leadership opportunities</li>
                                <li>• Build network in target role area</li>
                            </ul>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                            <h4 className="font-medium text-gray-900">Phase 3 (6+ months)</h4>
                            <ul className="text-sm text-gray-600 mt-1 space-y-1">
                                <li>• Apply for target role positions</li>
                                <li>• Complete advanced certifications</li>
                                <li>• Demonstrate readiness through performance</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
                    <div>
                        <h4 className="font-medium text-blue-900">Ready to start this pathway?</h4>
                        <p className="text-sm text-blue-700">Get personalized learning recommendations and mentorship matches.</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Create Development Plan
                    </button>
                </div>
            </div>
        </div>
    );
};
