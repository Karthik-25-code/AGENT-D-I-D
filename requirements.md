# Requirements Document

## Introduction

Agent D-I-D is a multi-modal AI learning environment that implements the Feynman Technique through dual AI personas. Students interact with two distinct AI agents on a shared digital whiteboard: Jarvis (a confused peer requiring teaching) and Ultron (a master teacher providing clarity). The platform uses voice and visual interactions to promote active learning rather than passive consumption.

## Glossary

- **System**: The Agent D-I-D learning platform
- **Student**: The human user learning through the platform
- **Jarvis**: The "dumb" AI agent persona that requires teaching from the student
- **Ultron**: The "smart" AI agent persona that provides expert explanations
- **Whiteboard**: The shared digital canvas where visual interactions occur
- **Mode_A**: The learning mode where Jarvis is active and the student teaches
- **Mode_B**: The learning mode where Ultron is active and teaches the student
- **Session**: A continuous learning interaction with topic context and history
- **Teaching_History**: The record of student interactions with Jarvis over time
- **Sketch**: Visual content drawn on the whiteboard by student or agents

## Requirements

### Requirement 1: Dual AI Persona System

**User Story:** As a student, I want to interact with two distinct AI personalities with different intelligence levels, so that I can learn through both teaching and being taught.

#### Acceptance Criteria

1. THE System SHALL provide two distinct AI agent modes: Mode_A (Jarvis) and Mode_B (Ultron)
2. WHEN Mode_A is active, THE System SHALL use a prompt configuration that makes Jarvis behave as a confused peer
3. WHEN Mode_B is active, THE System SHALL use a prompt configuration that makes Ultron behave as a master teacher
4. THE System SHALL use Amazon Bedrock with Claude 3.5 Sonnet as the underlying AI model for both personas
5. WHEN switching between modes, THE System SHALL maintain session context and topic continuity

### Requirement 2: Voice Interaction System

**User Story:** As a student, I want to hear the AI agents speak with distinct voices, so that I can engage in natural conversational learning.

#### Acceptance Criteria

1. THE System SHALL use Amazon Polly for text-to-speech conversion
2. WHEN Jarvis speaks, THE System SHALL use a hesitant and curious voice profile
3. WHEN Ultron speaks, THE System SHALL use a confident and authoritative voice profile
4. WHEN an agent generates text response, THE System SHALL convert it to speech within 2 seconds
5. THE System SHALL support voice playback controls including pause, resume, and stop

### Requirement 3: Digital Whiteboard System

**User Story:** As a student, I want to draw and visualize concepts on a shared whiteboard, so that I can engage in visual learning with the AI agents.

#### Acceptance Criteria

1. THE System SHALL provide a digital whiteboard canvas for drawing and sketching
2. WHEN a student draws on the whiteboard, THE System SHALL capture the sketch in real-time
3. WHEN an agent draws on the whiteboard, THE System SHALL render the drawing with smooth animation
4. THE System SHALL support basic drawing tools including pen, eraser, and color selection
5. THE System SHALL allow clearing the whiteboard while preserving session history

### Requirement 4: Visual Recognition System

**User Story:** As a student, I want the AI agents to understand what I draw on the whiteboard, so that they can respond appropriately to my visual explanations.

#### Acceptance Criteria

1. THE System SHALL use Amazon Rekognition to analyze whiteboard sketches
2. WHEN a student completes a sketch, THE System SHALL process the image and extract visual features
3. WHEN Jarvis requests explanation, THE System SHALL analyze the student's drawing and provide context to the AI model
4. WHEN Ultron provides explanation, THE System SHALL use visual recognition to understand existing whiteboard content
5. IF visual recognition fails, THEN THE System SHALL fall back to text-based interaction and log the error

### Requirement 5: Jarvis Behavior (Mode A - Teaching Mode)

**User Story:** As a student, I want to teach concepts to Jarvis who makes mistakes, so that I can achieve deep understanding through active recall.

#### Acceptance Criteria

1. WHEN Mode_A is active, THE Jarvis SHALL ask the student to explain concepts on the whiteboard
2. WHEN Jarvis attempts to draw, THE Jarvis SHALL intentionally make conceptual errors requiring student correction
3. WHEN a student corrects Jarvis, THE System SHALL acknowledge the correction and update Jarvis's understanding
4. THE Jarvis SHALL ask follow-up questions that probe the student's understanding
5. WHEN a student explanation is incomplete, THE Jarvis SHALL express confusion and request clarification

### Requirement 6: Ultron Behavior (Mode B - Learning Mode)

**User Story:** As a student, I want to summon Ultron when I'm stuck, so that I can receive expert explanations with visual demonstrations.

#### Acceptance Criteria

1. WHEN Mode_B is activated, THE Ultron SHALL take control of the whiteboard
2. WHEN Ultron explains a concept, THE Ultron SHALL draw clear diagrams and visual representations
3. WHEN Ultron draws, THE System SHALL render the drawings with precision and clarity
4. THE Ultron SHALL explain both the "what" and the "why" behind concepts
5. WHEN Ultron completes an explanation, THE System SHALL offer to return to Mode_A for student practice

### Requirement 7: Real-Time Synchronization

**User Story:** As a student, I want to see agent drawings appear in real-time without lag, so that the learning experience feels natural and responsive.

#### Acceptance Criteria

1. THE System SHALL use AWS AppSync with WebSockets for real-time communication
2. WHEN an agent draws on the whiteboard, THE System SHALL synchronize the drawing to the student's view within 100 milliseconds
3. WHEN network latency exceeds 500 milliseconds, THE System SHALL display a connection quality indicator
4. THE System SHALL handle connection interruptions gracefully and resume synchronization when reconnected
5. WHEN multiple drawing operations occur, THE System SHALL maintain correct ordering and timing

### Requirement 8: Learning Progress Persistence

**User Story:** As a student, I want my learning progress and teaching history saved, so that I can continue learning across multiple sessions.

#### Acceptance Criteria

1. THE System SHALL use Amazon DynamoDB to store student data
2. WHEN a student teaches Jarvis, THE System SHALL record the interaction in Teaching_History
3. WHEN a student returns to the platform, THE System SHALL load their previous Teaching_History
4. THE System SHALL store whiteboard snapshots at key learning moments
5. WHEN a session ends, THE System SHALL persist all session data within 5 seconds

### Requirement 9: Mode Switching

**User Story:** As a student, I want to easily switch between teaching Jarvis and learning from Ultron, so that I can control my learning flow.

#### Acceptance Criteria

1. THE System SHALL provide a clear interface control for switching between Mode_A and Mode_B
2. WHEN a student switches modes, THE System SHALL transition within 2 seconds
3. WHEN switching from Mode_A to Mode_B, THE System SHALL preserve whiteboard content
4. WHEN switching from Mode_B to Mode_A, THE System SHALL allow Jarvis to reference Ultron's previous explanation
5. THE System SHALL limit mode switches to prevent rapid toggling (minimum 30 seconds between switches)

### Requirement 10: Session Management

**User Story:** As a student, I want to start, pause, and end learning sessions, so that I can learn at my own pace.

#### Acceptance Criteria

1. WHEN a student starts a new session, THE System SHALL prompt for a topic or learning goal
2. WHEN a session is active, THE System SHALL track elapsed time and interaction count
3. WHEN a student pauses a session, THE System SHALL save the current state and allow resumption
4. WHEN a student ends a session, THE System SHALL provide a summary of what was learned
5. THE System SHALL automatically save session state every 60 seconds

### Requirement 11: Error Handling and Fallbacks

**User Story:** As a student, I want the system to handle errors gracefully, so that technical issues don't disrupt my learning experience.

#### Acceptance Criteria

1. WHEN Amazon Bedrock API fails, THE System SHALL retry up to 3 times with exponential backoff
2. WHEN Amazon Polly fails, THE System SHALL display text responses as fallback
3. WHEN Amazon Rekognition fails, THE System SHALL continue with text-only interaction
4. WHEN AWS AppSync connection drops, THE System SHALL attempt reconnection and notify the student
5. IF critical services are unavailable, THEN THE System SHALL display a clear error message and save session state

### Requirement 12: Whiteboard Content Management

**User Story:** As a student, I want to manage whiteboard content effectively, so that I can organize my learning visually.

#### Acceptance Criteria

1. THE System SHALL support saving whiteboard snapshots with descriptive labels
2. WHEN a student requests to clear the whiteboard, THE System SHALL confirm before clearing
3. THE System SHALL allow loading previously saved whiteboard snapshots
4. WHEN whiteboard content becomes cluttered, THE System SHALL suggest creating a new canvas
5. THE System SHALL support exporting whiteboard content as image files

### Requirement 13: AI Response Quality

**User Story:** As a student, I want AI responses to be contextually appropriate and educationally valuable, so that I learn effectively.

#### Acceptance Criteria

1. WHEN Jarvis responds, THE System SHALL ensure responses align with the "confused peer" persona
2. WHEN Ultron responds, THE System SHALL ensure responses are accurate and comprehensive
3. THE System SHALL validate AI responses for educational appropriateness before delivery
4. WHEN an AI response is off-topic, THE System SHALL regenerate with improved context
5. THE System SHALL limit response length to maintain engagement (maximum 200 words per response)

### Requirement 14: Visual Drawing Quality

**User Story:** As a student, I want agent drawings to be clear and purposeful, so that visual explanations enhance my understanding.

#### Acceptance Criteria

1. WHEN Jarvis draws, THE System SHALL render drawings with intentional imperfections
2. WHEN Ultron draws, THE System SHALL render drawings with precision and clarity
3. THE System SHALL use appropriate colors and line weights for visual hierarchy
4. WHEN drawing complex diagrams, THE System SHALL build them incrementally with narration
5. THE System SHALL ensure all drawings are visible and not obscured by UI elements

### Requirement 15: Security and Privacy

**User Story:** As a student, I want my learning data to be secure and private, so that I can learn without privacy concerns.

#### Acceptance Criteria

1. THE System SHALL encrypt all data in transit using TLS 1.3
2. THE System SHALL encrypt all data at rest in DynamoDB using AWS KMS
3. THE System SHALL authenticate students before allowing access to their Teaching_History
4. THE System SHALL not share student data with third parties
5. WHEN a student requests data deletion, THE System SHALL remove all associated data within 24 hours
