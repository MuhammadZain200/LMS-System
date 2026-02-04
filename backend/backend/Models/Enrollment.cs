namespace backend.Models
{
    public class Enrollment
    {
        public int Id { get; set; }
        public int UserID { get; set; }
        public User User { get; set; }
        public int CourseID { get; set; }
        public Course Course { get; set; }
            

    }
}
