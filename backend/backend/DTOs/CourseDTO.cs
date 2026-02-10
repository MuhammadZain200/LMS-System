namespace backend.DTOs
{
    public class CourseDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int DurationInHours { get; set; }
        public decimal Price { get; set; }
        public string? Instructor { get; set; }

        /// <summary>
        /// Optional initial content for the course. This can later
        /// be edited by the assigned instructor via dedicated APIs.
        /// </summary>
        public string? Content { get; set; }
    }
}
