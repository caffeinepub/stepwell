import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  type StepEntry = {
    date : Text;
    steps : Nat;
  };

  type WellbeingEntry = {
    date : Text;
    moodScore : Nat;
    energyScore : Nat;
  };

  type HydrationEntry = {
    date : Text;
    glasses : Nat;
  };

  module StepEntry {
    public func compare(a : StepEntry, b : StepEntry) : Order.Order {
      Text.compare(a.date, b.date);
    };
  };

  module WellbeingEntry {
    public func compare(a : WellbeingEntry, b : WellbeingEntry) : Order.Order {
      Text.compare(a.date, b.date);
    };
  };

  module HydrationEntry {
    public func compare(a : HydrationEntry, b : HydrationEntry) : Order.Order {
      Text.compare(a.date, b.date);
    };
  };

  type UserData = {
    stepGoal : Nat;
    hydrationGoal : Nat;
    stepEntries : Map.Map<Text, StepEntry>;
    wellbeingEntries : Map.Map<Text, WellbeingEntry>;
    hydrationEntries : Map.Map<Text, HydrationEntry>;
  };

  let users = Map.empty<Principal, UserData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func getOrCreateUser(caller : Principal) : UserData {
    switch (users.get(caller)) {
      case (null) {
        let newUser : UserData = {
          stepGoal = 10000;
          hydrationGoal = 8;
          stepEntries = Map.empty<Text, StepEntry>();
          wellbeingEntries = Map.empty<Text, WellbeingEntry>();
          hydrationEntries = Map.empty<Text, HydrationEntry>();
        };
        users.add(caller, newUser);
        newUser;
      };
      case (?user) { user };
    };
  };

  // User Profile Management
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

  // Step Tracking
  public shared ({ caller }) func logSteps(date : Text, steps : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log steps");
    };
    let user = getOrCreateUser(caller);
    let entry : StepEntry = {
      date;
      steps;
    };
    user.stepEntries.add(date, entry);
  };

  public shared ({ caller }) func setStepGoal(goal : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set step goals");
    };
    let user = getOrCreateUser(caller);
    let updatedUser : UserData = {
      user with stepGoal = goal;
    };
    users.add(caller, updatedUser);
  };

  public query ({ caller }) func getStepGoal() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view step goals");
    };
    let user = getOrCreateUser(caller);
    user.stepGoal;
  };

  public query ({ caller }) func getTodaySteps(today : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view steps");
    };
    let user = getOrCreateUser(caller);
    switch (user.stepEntries.get(today)) {
      case (null) { 0 };
      case (?entry) { entry.steps };
    };
  };

  public query ({ caller }) func getLast7DaysSteps() : async [StepEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view step history");
    };
    let user = getOrCreateUser(caller);
    user.stepEntries.values().toArray().sort();
  };

  // Wellbeing Check-in
  public shared ({ caller }) func logWellbeing(date : Text, moodScore : Nat, energyScore : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log wellbeing");
    };
    if (moodScore < 1 or moodScore > 5) {
      Runtime.trap("Mood score must be between 1 and 5");
    };
    if (energyScore < 1 or energyScore > 5) {
      Runtime.trap("Energy score must be between 1 and 5");
    };

    let user = getOrCreateUser(caller);
    let entry : WellbeingEntry = {
      date;
      moodScore;
      energyScore;
    };
    user.wellbeingEntries.add(date, entry);
  };

  public query ({ caller }) func getTodayWellbeing(today : Text) : async ?WellbeingEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wellbeing");
    };
    let user = getOrCreateUser(caller);
    user.wellbeingEntries.get(today);
  };

  public query ({ caller }) func getLast7DaysWellbeing() : async [WellbeingEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wellbeing history");
    };
    let user = getOrCreateUser(caller);
    user.wellbeingEntries.values().toArray().sort();
  };

  // Hydration Tracking
  public shared ({ caller }) func logHydration(date : Text, glasses : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log hydration");
    };
    let user = getOrCreateUser(caller);
    let entry : HydrationEntry = {
      date;
      glasses;
    };
    user.hydrationEntries.add(date, entry);
  };

  public shared ({ caller }) func setHydrationGoal(goal : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set hydration goals");
    };
    let user = getOrCreateUser(caller);
    let updatedUser : UserData = {
      user with hydrationGoal = goal;
    };
    users.add(caller, updatedUser);
  };

  public query ({ caller }) func getHydrationGoal() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view hydration goals");
    };
    let user = getOrCreateUser(caller);
    user.hydrationGoal;
  };

  public query ({ caller }) func getTodayHydration(today : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view hydration");
    };
    let user = getOrCreateUser(caller);
    switch (user.hydrationEntries.get(today)) {
      case (null) { 0 };
      case (?entry) { entry.glasses };
    };
  };

  public query ({ caller }) func getLast7DaysHydration() : async [HydrationEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view hydration history");
    };
    let user = getOrCreateUser(caller);
    user.hydrationEntries.values().toArray().sort();
  };
};
