// src/context/AppDataContext.js
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../services/AuthContext";
import { apiService } from "../services/api";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [employeeSkills, setEmployeeSkills] = useState([]); // [{function_area, specialization, skill_name}]
  const [catalogue, setCatalogue] = useState([]); // org-level skills: employee_id === null
  const [functionAreas, setFunctionAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  useEffect(() => {
   const id = user?.employeeId;
   if (id) {
     setSelectedEmployeeId(id);
   } else {
     setSelectedEmployeeId(null);
     setEmployee(null);
     setEmployeeSkills([]);
   }
  }, [user]); 


  // Fetch employees list
  const fetchEmployees = useCallback(async () => {
    try {
      setErrors(null);
      const res = await apiService.listEmployees();
      const rows = Array.isArray(res) ? res : res.data || [];
      setEmployees(rows);
    } catch (e) {
      console.error(e);
      setErrors((prev) => ({ ...prev, employees: e.message }));
    }
  }, []);

  // Fetch selected employee detail & skills
  const fetchEmployeeDetail = useCallback(async (employeeId) => {
    if (!employeeId) return;
    console.log('Fetching employee:', employeeId);
    try {
      setErrors(null);
      const [profileRes, skillsRes] = await Promise.all([
        apiService.getEmployee(employeeId),
        apiService.getEmployeeSkills(employeeId),
      ]);
      const profile = profileRes?.data ?? null;
      const rawSkills = skillsRes?.data ?? skillsRes;
      const skills = Array.isArray(rawSkills) ? rawSkills : [];
      console.log('Fetched skills for', employeeId, ':', skills);
      setEmployee(profile);
      setEmployeeSkills(skills);
    } catch (e) {
      console.error(e);
      setErrors((prev) => ({ ...prev, employee: e.message }));
    }
  }, []);

  // Fetch skills catalogue
  const fetchCatalogue = useCallback(async () => {
    try {
      setErrors(null);
      // pull everything and consider rows with employee_id == null as catalogue
      const resCat = await apiService.listSkills();
      const rows = Array.isArray(resCat) ? resCat : resCat?.data || [];
      setCatalogue(rows);
    } catch (e) {
      console.error(e);
      setErrors((prev) => ({ ...prev, catalogue: e.message }));
    }
  }, []);

  // Fetch taxonomy function areas
  const fetchFunctionAreas = useCallback(async () => {
    try {
      const res = await apiService.listFunctionAreas(); // /api/taxonomy/function-areas
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setFunctionAreas(list);
    } catch (e) {
      console.error(e);
      setFunctionAreas([]);
    }
  }, []);

  // initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEmployees(), fetchCatalogue(), fetchFunctionAreas()])
      .finally(() => setLoading(false));
  }, [fetchEmployees, fetchCatalogue, fetchFunctionAreas]);

  // when selection changes
  useEffect(() => {
    if (selectedEmployeeId) fetchEmployeeDetail(selectedEmployeeId);
  }, [selectedEmployeeId, fetchEmployeeDetail]);

  // Derived data / selectors
  const specializationsByFunction = useCallback(
    (functionArea) => {
      const set = new Set(
        catalogue
          .filter((r) => r.function_area === functionArea)
          .map((r) => r.specialization)
          .filter(Boolean)
      );
      return Array.from(set).sort();
    },
    [catalogue]
  );

  const requiredSkills = useCallback((functionArea, specialization) => {
    const cat = Array.isArray(catalogue) ? catalogue : [];
    const rows = cat.filter(
        (r) =>
            r.function_area === functionArea &&
            (!specialization || r.specialization === specialization)
    );
    const set = new Set(rows.map((r) => r?.skill_name?.trim()).filter(Boolean));
    return Array.from(set).sort();
  }, [catalogue]);

  const employeeSkillNames = useMemo(() => {
    const arr = Array.isArray(employeeSkills) ? employeeSkills : [];
    const set = new Set(arr.map((s) => s?.skill_name?.trim()).filter(Boolean));
    return Array.from(set);
  }, [employeeSkills]);

  const computeStrengthsAndGaps = useCallback(
    (functionArea, specialization) => {
      const req = new Set(requiredSkills(functionArea, specialization));
      const emp = new Set(employeeSkillNames);

      const strengths = Array.from(req).filter((s) => emp.has(s)).sort();
      const gaps = Array.from(req).filter((s) => !emp.has(s)).sort();

      return { strengths, gaps };
    },
    [requiredSkills, employeeSkillNames]
  );

  const value = {
    // raw
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    employee,
    employeeSkills,
    catalogue,
    loading,
    errors,

    // derived/selectors
    functionAreas,
    specializationsByFunction,
    requiredSkills,
    employeeSkillNames,
    computeStrengthsAndGaps,

    // controls
    refreshEmployees: fetchEmployees,
    refreshCatalogue: fetchCatalogue,
    refreshEmployee: () => fetchEmployeeDetail(selectedEmployeeId),
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within <AppDataProvider>");
  return ctx;
}
