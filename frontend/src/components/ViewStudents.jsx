import React, {useState} from "react";
import "../styles/ViewStudents.css";

function ViewStudents({students, isOpen, isClose}) {

    if (!isOpen) return null;
    return (
        <div className="view-students-modal">
            <div className="view-students-modal-content">
                <h2>Students</h2>
                
                {students.length === 0 ? (
                    <p className="view-students-no-students">No students are enrolled in this course</p>
                ):(
                <ul>
                    {students.map((student) => (
                        <li key={student.id}>{student.name} - {student.email}</li>
                    ))}
                </ul>
                )}
                <button onClick={isClose}>Close</button>
            </div>

        </div>
    );
}

export default ViewStudents;