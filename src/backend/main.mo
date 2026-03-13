import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Type definitions
  public type AttendanceRecord = {
    date : Text;
    status : Text;
  };

  public type TestScore = {
    subject : Text;
    score : Nat;
    totalMarks : Nat;
    grade : Text;
  };

  public type CurriculumTopic = {
    subject : Text;
    topic : Text;
  };

  public type TestQuestion = {
    subject : Text;
    question : Text;
    options : [Text];
    correctAnswer : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // Store state
  let studentAttendance = Map.empty<Principal, List.List<AttendanceRecord>>();
  let studentTestScores = Map.empty<Principal, List.List<TestScore>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let curriculumTopics : [CurriculumTopic] = [
    // Hindi
    { subject = "Hindi"; topic = "काव्य" },
    { subject = "Hindi"; topic = "गद्य" },
    { subject = "Hindi"; topic = "व्याकरण" },
    { subject = "Hindi"; topic = "पत्र लेखन" },
    // English
    { subject = "English"; topic = "Grammar" },
    { subject = "English"; topic = "Literature" },
    { subject = "English"; topic = "Writing Skills" },
    { subject = "English"; topic = "Reading Comprehension" },
    // Maths
    { subject = "Maths"; topic = "Algebra" },
    { subject = "Maths"; topic = "Geometry" },
    { subject = "Maths"; topic = "Trigonometry" },
    { subject = "Maths"; topic = "Statistics" },
    // Science
    { subject = "Science"; topic = "Physics" },
    { subject = "Science"; topic = "Chemistry" },
    { subject = "Science"; topic = "Biology" },
    { subject = "Science"; topic = "Environmental Science" },
  ];

  let testQuestions : [TestQuestion] = [
    // Hindi Questions
    {
      subject = "Hindi";
      question = "हिंदी व्याकरण में किसका अध्ययन किया जाता है?";
      options = ["कविता", "लेखन", "भाषा संरचना", "गद्य"];
      correctAnswer = 2;
    },
    {
      subject = "Hindi";
      question = "समास कितने प्रकार के होते हैं?";
      options = ["2", "3", "4", "5"];
      correctAnswer = 2;
    },
    {
      subject = "Hindi";
      question = "सन्धि का अर्थ क्या है?";
      options = ["वाक्य", "शब्द निर्माण", "लेखन", "व्याकरण"];
      correctAnswer = 1;
    },
    {
      subject = "Hindi";
      question = "अलंकार कितने प्रकार के होते हैं?";
      options = ["5", "10", "15", "20"];
      correctAnswer = 1;
    },
    {
      subject = "Hindi";
      question = "मुहावरे किस भाषा का अंग हैं?";
      options = ["अंग्रेजी", "संस्कृत", "हिंदी", "तमिल"];
      correctAnswer = 2;
    },

    // English Questions
    {
      subject = "English";
      question = "What is a pronoun?";
      options = ["A verb", "A noun", "A word that replaces a noun", "an adjective"];
      correctAnswer = 2;
    },
    {
      subject = "English";
      question = "What is the plural of 'child'?";
      options = ["Childs", "Childes", "Children", "Childies"];
      correctAnswer = 2;
    },
    {
      subject = "English";
      question = "What is a synonym for 'happy'?";
      options = ["Sad", "Angry", "Joyful", "Upset"];
      correctAnswer = 2;
    },
    {
      subject = "English";
      question = "What is a noun?";
      options = ["Name of a person, place, or thing", "An action word", "A describing word", "A preposition"];
      correctAnswer = 0;
    },
    {
      subject = "English";
      question = "What is an antonym for 'hot'?";
      options = ["Cold", "Warm", "Boiling", "Steamy"];
      correctAnswer = 0;
    },

    // Maths Questions
    {
      subject = "Maths";
      question = "What is the value of π?";
      options = ["2.14", "3.14", "4.14", "5.14"];
      correctAnswer = 1;
    },
    {
      subject = "Maths";
      question = "What is the square root of 16?";
      options = ["2", "3", "4", "5"];
      correctAnswer = 2;
    },
    {
      subject = "Maths";
      question = "What is the sum of the angles in a triangle?";
      options = ["90°", "180°", "270°", "360°"];
      correctAnswer = 1;
    },
    {
      subject = "Maths";
      question = "What is the area of a circle?";
      options = ["πr", "2πr", "πr²", "2πr²"];
      correctAnswer = 2;
    },
    {
      subject = "Maths";
      question = "What is the value of sin(90°)?";
      options = ["0", "0.5", "1", "2"];
      correctAnswer = 2;
    },

    // Science Questions
    {
      subject = "Science";
      question = "What is the chemical formula for water?";
      options = ["CO2", "O2", "H2O", "NaCl"];
      correctAnswer = 2;
    },
    {
      subject = "Science";
      question = "What is the powerhouse of the cell?";
      options = ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"];
      correctAnswer = 1;
    },
    {
      subject = "Science";
      question = "What is the process of photosynthesis?";
      options = ["Conversion of light into food", "Breathing", "Digestion", "Circulation"];
      correctAnswer = 0;
    },
    {
      subject = "Science";
      question = "What is the boiling point of water?";
      options = ["0°C", "50°C", "100°C", "200°C"];
      correctAnswer = 2;
    },
    {
      subject = "Science";
      question = "What is the symbol for sodium?";
      options = ["Na", "S", "N", "So"];
      correctAnswer = 0;
    },
  ];

  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Attendance functions
  public shared ({ caller }) func markAttendance(date : Text, status : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only students can mark attendance");
    };

    let attendanceList = switch (studentAttendance.get(caller)) {
      case (null) { List.empty<AttendanceRecord>() };
      case (?list) { list };
    };

    let newRecord : AttendanceRecord = {
      date;
      status;
    };

    attendanceList.add(newRecord);
    studentAttendance.add(caller, attendanceList);
    true;
  };

  public query ({ caller }) func getAttendance() : async [AttendanceRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only students can view attendance");
    };

    switch (studentAttendance.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  // Test score functions
  public shared ({ caller }) func addTestScore(subject : Text, score : Nat, totalMarks : Nat, grade : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only students can add test scores");
    };

    let scoreList = switch (studentTestScores.get(caller)) {
      case (null) { List.empty<TestScore>() };
      case (?list) { list };
    };

    let newScore : TestScore = {
      subject;
      score;
      totalMarks;
      grade;
    };

    scoreList.add(newScore);
    studentTestScores.add(caller, scoreList);
    true;
  };

  public query ({ caller }) func getTestScores() : async [TestScore] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only students can view test scores");
    };

    switch (studentTestScores.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  // Curriculum functions
  public query ({ caller }) func getCurriculum(subject : Text) : async [CurriculumTopic] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only students can view curriculum");
    };
    curriculumTopics.filter(func(topic) { topic.subject == subject });
  };

  // Test questions functions
  public query ({ caller }) func getTestQuestions(subject : Text) : async [TestQuestion] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only students can view test questions");
    };
    testQuestions.filter(func(question) { question.subject == subject });
  };
};
