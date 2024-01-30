import axios, {AxiosInstance} from 'axios'
import { User } from '../dto/User';

export class GameService {

    private apiUrl: string;
    private axiosInstance: AxiosInstance;
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
        this.axiosInstance = axios.create({baseURL: this.apiUrl})
    }

    /*addPost(post:Post) {
        return this.axiosInstance.post<Post>('/posts', post);
    }

    getPosts() {
        return this.axiosInstance.get<Post[]>('/posts');
    }

    updatePost(post:Post) {
        return this.axiosInstance.put<Post>('/posts', post)
    }

    deletePost(postId:number) {
        return this.axiosInstance.delete<void>('/posts/'+postId)
    }*/
}