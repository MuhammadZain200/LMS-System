namespace backend.DTOs
{
    public class EnrollmentDTO
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }   // for output
        public DateTime EnrolledAt { get; set; }  // for output
    }
}
